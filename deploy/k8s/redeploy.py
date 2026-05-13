#!/usr/bin/env python3
"""
redeploy.py
Redeploys the application layer (backend + frontend) without touching
platform infrastructure (postgres, redis, gateway, etc.).

Usage:
  python3 redeploy.py               # redeploy both
  python3 redeploy.py --backend     # backend only
  python3 redeploy.py --frontend    # frontend only
  python3 redeploy.py --no-restart  # skip rollout-restart (helm upgrade only)
  python3 redeploy.py --recompute   # regenerate values-computed.yaml first
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import compute_resources

SCRIPT_DIR = Path(__file__).parent.resolve()
COMPUTED_VALUES = SCRIPT_DIR / "values-computed.yaml"


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    print(f"  $ {' '.join(cmd)}")
    return subprocess.run(cmd, check=True, cwd=SCRIPT_DIR)


def step(msg: str) -> None:
    print(f"\n{'─' * 60}")
    print(f"  {msg}")
    print("─" * 60)


def helm_upgrade(release: str, chart: str, values: Path) -> None:
    run([
        "helm", "upgrade", "--install", release, chart,
        "--namespace", "default",
        "--values", str(values),
    ])


def rollout_restart(deployment: str) -> None:
    run(["kubectl", "rollout", "restart", f"deployment/{deployment}", "-n", "default"])
    run(["kubectl", "rollout", "status",  f"deployment/{deployment}", "-n", "default",
         "--timeout=120s"])


def ensure_computed_values(recompute: bool) -> Path:
    if recompute or not COMPUTED_VALUES.exists():
        if not COMPUTED_VALUES.exists():
            print("⚠️  values-computed.yaml not found — computing now...")
        step("Computing resource allocations")
        result = compute_resources.run(SCRIPT_DIR)
        return result["values_path"]
    print(f"  Using existing {COMPUTED_VALUES.name}")
    return COMPUTED_VALUES


def deploy_backend(values: Path, restart: bool) -> None:
    step("Upgrading Backend")
    helm_upgrade("backend", "backend", values)
    print("✅ Backend chart upgraded")
    if restart:
        step("Restarting Backend pods")
        rollout_restart("backend-app")
        rollout_restart("backend-app-worker")
        print("✅ Backend rollout complete")


def deploy_frontend(values: Path, restart: bool) -> None:
    step("Upgrading Frontend")
    helm_upgrade("frontend", "frontend", values)
    print("✅ Frontend chart upgraded")
    if restart:
        step("Restarting Frontend pods")
        rollout_restart("frontend-app")
        print("✅ Frontend rollout complete")


def main() -> None:
    parser = argparse.ArgumentParser(description="Redeploy Stock Finder application charts")
    parser.add_argument("--backend",    action="store_true", help="Redeploy backend only")
    parser.add_argument("--frontend",   action="store_true", help="Redeploy frontend only")
    parser.add_argument("--no-restart", action="store_true", help="Skip rollout-restart after upgrade")
    parser.add_argument("--recompute",  action="store_true", help="Regenerate values-computed.yaml")
    args = parser.parse_args()

    # Default: deploy both when neither flag is set
    do_backend  = args.backend  or (not args.backend and not args.frontend)
    do_frontend = args.frontend or (not args.backend and not args.frontend)
    restart = not args.no_restart

    print("🚀 Stock Finder — application redeploy")

    values = ensure_computed_values(args.recompute)

    if do_backend:
        deploy_backend(values, restart)

    if do_frontend:
        deploy_frontend(values, restart)

    print("\n" + "=" * 50)
    print("🎉 Redeploy complete!")
    print("=" * 50)
    if do_backend:
        print("  ✅ Backend upgraded (web + worker)")
    if do_frontend:
        print("  ✅ Frontend upgraded")
    print("\nCheck pod status:")
    print("  kubectl get pods -n default")
    print("  kubectl logs -l app=backend-app --tail=100 -f -n default")


if __name__ == "__main__":
    main()
