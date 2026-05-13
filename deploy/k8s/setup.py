#!/usr/bin/env python3
"""
setup.py
Full Kubernetes deployment script for Stock Finder.
Detects machine resources, installs helm/minikube if needed,
starts minikube with computed resources, then deploys all Helm charts.
"""
from __future__ import annotations

import os
import platform
import shutil
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import compute_resources

SCRIPT_DIR = Path(__file__).parent.resolve()
BACKUP_DIR = Path.home() / ".stock-finder-backup"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    print(f"  $ {' '.join(cmd)}")
    return subprocess.run(cmd, check=True, cwd=SCRIPT_DIR, **kwargs)


def check_output(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, text=True).strip()


def is_installed(tool: str) -> bool:
    return shutil.which(tool) is not None


def step(msg: str) -> None:
    print(f"\n{'─'*60}")
    print(f"📦 {msg}")
    print('─'*60)


# ---------------------------------------------------------------------------
# Tool installation
# ---------------------------------------------------------------------------

def ensure_helm() -> None:
    step("Checking Helm")
    if is_installed("helm"):
        print(f"✅ Helm ready: {check_output(['helm', 'version', '--short'])}")
        return

    print("⚙️  Helm not found — installing...")
    if platform.system() == "Darwin" and is_installed("brew"):
        run(["brew", "install", "helm"])
    else:
        get_helm = subprocess.check_output(
            ["curl", "-fsSL", "https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3"],
        )
        subprocess.run(["bash"], input=get_helm, check=True)

    print(f"✅ Helm installed: {check_output(['helm', 'version', '--short'])}")


def ensure_minikube() -> None:
    step("Checking Minikube")
    if is_installed("minikube"):
        print(f"✅ Minikube ready: {check_output(['minikube', 'version', '--short'])}")
        return

    print("⚙️  Minikube not found — installing...")
    system = platform.system()
    arch = platform.machine()

    if system == "Darwin" and is_installed("brew"):
        run(["brew", "install", "minikube"])
    elif system == "Darwin":
        url = f"https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-{arch}"
        run(["curl", "-Lo", "/tmp/minikube", url])
        run(["install", "/tmp/minikube", "/usr/local/bin/minikube"])
    else:
        run(["curl", "-Lo", "/tmp/minikube",
             "https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"])
        run(["install", "/tmp/minikube", "/usr/local/bin/minikube"])

    print(f"✅ Minikube installed: {check_output(['minikube', 'version', '--short'])}")


# ---------------------------------------------------------------------------
# Volume backup / restore
# ---------------------------------------------------------------------------

def _wait_for_pod(pod: str, namespace: str = "default", timeout: int = 180) -> bool:
    print(f"  Waiting for {pod}...")
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            phase = check_output([
                "kubectl", "get", "pod", pod, "-n", namespace,
                "-o", "jsonpath={.status.phase}",
            ])
            if phase == "Running":
                return True
        except subprocess.CalledProcessError:
            pass
        time.sleep(5)
    print(f"  ⚠️  Timed out waiting for {pod}")
    return False


def backup_volumes() -> None:
    step("Backing up persistent volumes")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    # PostgreSQL — dump stock_finder with DROP/CREATE so restore is idempotent
    try:
        print("  Backing up PostgreSQL...")
        result = subprocess.run(
            ["kubectl", "exec", "-n", "default", "postgres-0",
             "--", "pg_dump", "-U", "postgres", "--clean", "--if-exists", "stock_finder"],
            capture_output=True, text=True, check=True,
        )
        (BACKUP_DIR / "postgres.sql").write_text(result.stdout)
        print("✅ PostgreSQL backed up")
    except subprocess.CalledProcessError:
        print("⚠️  PostgreSQL backup skipped (pod not running)")

    # SeaweedFS — copy /data off the node
    try:
        print("  Backing up SeaweedFS...")
        seaweedfs_dir = BACKUP_DIR / "seaweedfs"
        seaweedfs_dir.mkdir(exist_ok=True)
        run(["kubectl", "cp", "default/seaweedfs-0:/data", str(seaweedfs_dir)])
        print("✅ SeaweedFS backed up")
    except subprocess.CalledProcessError:
        print("⚠️  SeaweedFS backup skipped (pod not running)")


def restore_volumes() -> None:
    if not BACKUP_DIR.exists():
        return

    step("Restoring persistent volumes")

    pg_backup = BACKUP_DIR / "postgres.sql"
    if pg_backup.exists() and _wait_for_pod("postgres-0"):
        try:
            subprocess.run(
                ["kubectl", "exec", "-i", "-n", "default", "postgres-0",
                 "--", "psql", "-U", "postgres", "-d", "stock_finder"],
                input=pg_backup.read_text(), text=True, check=True,
            )
            print("✅ PostgreSQL restored")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  PostgreSQL restore failed: {e}")

    seaweedfs_backup = BACKUP_DIR / "seaweedfs"
    if seaweedfs_backup.exists() and _wait_for_pod("seaweedfs-0"):
        try:
            run(["kubectl", "cp", str(seaweedfs_backup), "default/seaweedfs-0:/data"])
            run(["kubectl", "rollout", "restart", "statefulset/seaweedfs", "-n", "default"])
            print("✅ SeaweedFS restored")
        except subprocess.CalledProcessError:
            print("⚠️  SeaweedFS restore failed")


# ---------------------------------------------------------------------------
# Minikube lifecycle
# ---------------------------------------------------------------------------

def minikube_is_running() -> bool:
    try:
        status = check_output(["minikube", "status", "--format={{.Host}}"])
        return status.strip() == "Running"
    except subprocess.CalledProcessError:
        return False


def minikube_current_config() -> tuple[int, int]:
    try:
        cpu_str = check_output([
            "kubectl", "get", "node", "minikube",
            "-o", "jsonpath={.status.capacity.cpu}",
        ])
        mem_str = check_output([
            "kubectl", "get", "node", "minikube",
            "-o", "jsonpath={.status.capacity.memory}",
        ])
        cpus = int(cpu_str.strip())
        if mem_str.endswith("Ki"):
            mem_mb = int(mem_str[:-2]) // 1024
        else:
            mem_mb = int(mem_str) // 1024 // 1024
        return cpus, mem_mb
    except (subprocess.CalledProcessError, ValueError):
        return 0, 0


def ensure_minikube_running(cpus: int, memory_mb: int) -> None:
    step(f"Starting Minikube ({cpus} CPUs, {memory_mb}MB RAM)")

    if minikube_is_running():
        current_cpus, current_mem = minikube_current_config()
        if current_cpus == cpus and current_mem == memory_mb:
            print("✅ Minikube already running with correct resources")
            return

        print(f"⚠️  Resource mismatch (running: {current_cpus}C/{current_mem}MB, "
              f"target: {cpus}C/{memory_mb}MB) — backing up data before restart...")
        backup_volumes()
        run(["minikube", "stop"])
        run(["minikube", "delete"])

    run([
        "minikube", "start",
        "--cpus",   str(cpus),
        "--memory", f"{memory_mb}mb",
        "--driver", "docker",
    ])
    print("✅ Minikube running")


# ---------------------------------------------------------------------------
# Helm chart deployments
# ---------------------------------------------------------------------------

def helm(release: str, chart: str, *extra_args: str, values: Path | None = None) -> None:
    cmd = ["helm", "upgrade", "--install", release, chart]
    if values:
        cmd += ["--values", str(values)]
    cmd += list(extra_args)
    run(cmd)


def deploy_all(computed: Path) -> None:
    # 1. Gateway API CRDs (nginx-gateway-fabric v2.2.2 requires Gateway API v1.2.0)
    # Using direct HTTP download instead of kubectl kustomize with a remote GitHub URL
    # to avoid the git-over-HTTPS timeout that kustomize triggers internally.
    step("Installing Gateway API CRDs")
    run([
        "kubectl", "apply", "-f",
        "https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml",
    ])
    print("✅ Gateway API CRDs installed")

    # 2. Gateway namespace
    step("Creating Gateway namespace")
    ns_yaml = check_output(["kubectl", "create", "namespace", "gateway-ns",
                             "--dry-run=client", "-o", "yaml"])
    subprocess.run(["kubectl", "apply", "-f", "-"], input=ns_yaml, text=True,
                   check=True, cwd=SCRIPT_DIR)
    print("✅ Gateway namespace created")

    # 3. NGINX Gateway Fabric
    step("Installing NGINX Gateway Fabric")
    helm("nginx-gateway",
         "oci://ghcr.io/nginx/charts/nginx-gateway-fabric",
         "--version", "2.2.1",
         "--namespace", "gateway-ns",
         "-f", "platform/controllers/nginx-gateway/values.yaml")
    print("✅ NGINX Gateway Fabric installed")

    # 4. Platform namespaces / ReferenceGrant
    step("Installing Platform Namespaces")
    helm("platform-namespaces", "platform/namespaces")
    print("✅ Platform Namespaces installed")

    # 5. Platform gateway + HTTPRoutes
    step("Installing Platform Gateway")
    helm("platform-gateway", "platform/gateway", "--namespace", "gateway-ns")
    print("✅ Platform Gateway installed")

    # 6. PostgreSQL + PostGIS
    step("Installing PostgreSQL")
    helm("platform-db", "platform/databases/postgres", values=computed)
    print("✅ PostgreSQL installed")

    # 7. Redis
    step("Installing Redis Cache")
    helm("platform-cache", "platform/cache", values=computed)
    print("✅ Redis Cache installed")

    # 8. SeaweedFS object storage
    step("Installing SeaweedFS Object Storage")
    helm("object-storage", "platform/storage/object", "--namespace", "default", values=computed)
    print("✅ SeaweedFS Object Storage installed")

    # 9. GHCR image pull secret
    ghcr_pat = os.environ.get("GHCR_PAT", "")
    if not ghcr_pat:
        print("⚠️  GHCR_PAT env var not set — skipping platform-registry deploy.")
        print("   Re-run with: GHCR_PAT=<your_token> python3 setup.py")
    else:
        ghcr_email = os.environ.get("GHCR_EMAIL", "")
        step("Installing GHCR image pull secret")
        helm("platform-registry", "platform/registry",
             "--namespace", "default",
             "--set", f"docker.password={ghcr_pat}",
             "--set", f"docker.email={ghcr_email}")
        print("✅ Registry secret installed")

    # 10. Shared app components (ServiceAccount)
    step("Installing Shared Application Components")
    helm("apps-shared", "shared", "--namespace", "default")
    print("✅ Shared components installed")

    # 11. Backend (web + worker)
    step("Installing Backend Application")
    helm("backend", "backend", "--namespace", "default", values=computed)
    print("✅ Backend Application installed")

    # 12. Frontend
    step("Installing Frontend Application")
    helm("frontend", "frontend", "--namespace", "default", values=computed)
    print("✅ Frontend Application installed")

    # 13. Cloudflare Tunnel
    step("Installing Cloudflare Tunnel")
    helm("cloudflared", "platform/cloudflare",
         "--namespace", "gateway-ns", "--create-namespace")
    print("✅ Cloudflare Tunnel installed")

    # 14. Restore volumes if a backup exists from a prior cluster teardown
    restore_volumes()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("🚀 Starting Stock Finder Kubernetes deployment...")

    step("Detecting machine resources")
    result = compute_resources.run(SCRIPT_DIR)
    computed      = result["values_path"]
    minikube_cpus = result["minikube_cpus"]
    minikube_mem  = result["minikube_memory_mb"]
    print(f"✅ Resources computed → minikube: {minikube_cpus} CPUs, {minikube_mem}MB RAM")

    ensure_helm()
    ensure_minikube()
    ensure_minikube_running(minikube_cpus, minikube_mem)
    deploy_all(computed)

    print("\n" + "=" * 50)
    print("🎉 Stock Finder deployment completed!")
    print("=" * 50)
    print(f"\n  ✅ Minikube  ({minikube_cpus} CPUs, {minikube_mem}MB RAM)")
    print("  ✅ Gateway API CRDs + NGINX Gateway Fabric")
    print("  ✅ PostgreSQL · Redis · SeaweedFS")
    print("  ✅ Backend (web + worker) · Frontend · Cloudflare Tunnel")
    print("\nTo check status:")
    print("  kubectl get pods -A")
    print("  kubectl get gateway -n gateway-ns")
    print("\nUseful commands:")
    print("  kubectl logs -l app=backend-app --tail=100 -f")
    print("  kubectl exec -it deploy/backend-app -- python manage.py shell")


if __name__ == "__main__":
    main()
