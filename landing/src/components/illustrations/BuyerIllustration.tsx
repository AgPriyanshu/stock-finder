export function BuyerIllustration() {
  return (
    <svg
      viewBox="0 0 480 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="480" height="220" rx="16" fill="#EFF6FF" />

      {/* --- Person figure (centered at x=90) --- */}
      {/* Head */}
      <circle cx="90" cy="52" r="24" fill="#bfdbfe" />

      {/* Body */}
      <rect x="66" y="82" width="48" height="56" rx="14" fill="#93c5fd" />

      {/* Left arm — hangs naturally at side */}
      <rect x="48" y="86" width="16" height="40" rx="8" fill="#93c5fd" />

      {/* Right arm — extended forward holding phone */}
      <rect x="116" y="86" width="16" height="40" rx="8" fill="#93c5fd" />

      {/* Legs */}
      <rect x="68" y="132" width="20" height="36" rx="8" fill="#60a5fa" />
      <rect x="92" y="132" width="20" height="36" rx="8" fill="#60a5fa" />

      {/* Phone — held in front, right side of body */}
      <rect x="118" y="98" width="34" height="52" rx="6" fill="#1e40af" />
      <rect x="122" y="103" width="26" height="38" rx="4" fill="#60a5fa" />
      <rect x="126" y="107" width="18" height="6" rx="2" fill="white" opacity="0.85" />
      <rect x="126" y="116" width="12" height="4" rx="2" fill="white" opacity="0.55" />
      <rect x="126" y="122" width="15" height="4" rx="2" fill="white" opacity="0.55" />

      {/* Speech bubble — search */}
      <rect x="170" y="48" width="180" height="50" rx="12" fill="white" />
      <polygon points="170,78 182,88 182,78" fill="white" />
      <circle cx="194" cy="73" r="9" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
      <line x1="200" y1="79" x2="205" y2="84" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="212" y="66" width="96" height="8" rx="4" fill="#e5e7eb" />
      <rect x="212" y="78" width="64" height="6" rx="3" fill="#f3f4f6" />

      {/* Dashed arrow pointing right */}
      <line x1="358" y1="110" x2="386" y2="110" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 4" />
      <polygon points="386,106 394,110 386,114" fill="#3b82f6" />

      {/* Map panel */}
      <rect x="400" y="28" width="72" height="164" rx="12" fill="white" />
      <rect x="407" y="36" width="58" height="72" rx="8" fill="#dbeafe" />
      {/* Roads */}
      <rect x="407" y="68" width="58" height="4" rx="1" fill="#bfdbfe" />
      <rect x="430" y="36" width="4" height="72" rx="1" fill="#bfdbfe" />
      {/* Pins */}
      <circle cx="424" cy="58" r="8" fill="#F97316" />
      <circle cx="424" cy="58" r="3.5" fill="white" />
      <circle cx="446" cy="74" r="6" fill="#94a3b8" />
      <circle cx="446" cy="74" r="2.5" fill="white" />
      <circle cx="418" cy="80" r="6" fill="#94a3b8" />
      <circle cx="418" cy="80" r="2.5" fill="white" />
      {/* Result cards */}
      <rect x="407" y="116" width="58" height="22" rx="6" fill="#f9fafb" />
      <circle cx="418" cy="127" r="6" fill="#FFF7ED" />
      <rect x="415" y="124" width="6" height="6" rx="1.5" fill="#F97316" opacity="0.6" />
      <rect x="427" y="121" width="30" height="5" rx="2" fill="#374151" />
      <rect x="427" y="129" width="20" height="4" rx="2" fill="#9ca3af" />
      <rect x="407" y="142" width="58" height="22" rx="6" fill="#f9fafb" />
      <circle cx="418" cy="153" r="6" fill="#f0fdf4" />
      <rect x="415" y="150" width="6" height="6" rx="1.5" fill="#22c55e" opacity="0.6" />
      <rect x="427" y="147" width="24" height="5" rx="2" fill="#374151" />
      <rect x="427" y="155" width="16" height="4" rx="2" fill="#9ca3af" />
      <rect x="407" y="168" width="58" height="18" rx="6" fill="#f9fafb" />
      <circle cx="418" cy="177" r="6" fill="#eff6ff" />
      <rect x="415" y="174" width="6" height="6" rx="1.5" fill="#60a5fa" opacity="0.6" />
      <rect x="427" y="172" width="28" height="5" rx="2" fill="#374151" />
      <rect x="427" y="179" width="18" height="4" rx="2" fill="#9ca3af" />
    </svg>
  );
}
