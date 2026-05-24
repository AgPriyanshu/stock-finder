export function OwnerIllustration() {
  return (
    <svg
      viewBox="0 0 480 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="480" height="220" rx="16" fill="#FFF7ED" />

      {/* Shop / shelves */}
      {/* Shelf unit */}
      <rect x="20" y="50" width="170" height="150" rx="8" fill="#fed7aa" />
      {/* Shelves */}
      <rect x="24" y="80" width="162" height="6" rx="2" fill="#fb923c" />
      <rect x="24" y="120" width="162" height="6" rx="2" fill="#fb923c" />
      <rect x="24" y="160" width="162" height="6" rx="2" fill="#fb923c" />
      {/* Items on shelves */}
      {/* Row 1 */}
      <rect x="32" y="58" width="24" height="22" rx="4" fill="#fbbf24" />
      <rect x="62" y="60" width="18" height="20" rx="4" fill="#34d399" />
      <rect x="86" y="56" width="28" height="24" rx="4" fill="#60a5fa" />
      <rect x="120" y="62" width="20" height="18" rx="4" fill="#f87171" />
      <rect x="146" y="58" width="26" height="22" rx="4" fill="#a78bfa" />
      {/* Row 2 */}
      <rect x="32" y="90" width="20" height="30" rx="4" fill="#34d399" />
      <rect x="58" y="95" width="28" height="25" rx="4" fill="#fbbf24" />
      <rect x="92" y="88" width="22" height="32" rx="4" fill="#60a5fa" />
      <rect x="120" y="92" width="30" height="28" rx="4" fill="#fb923c" />
      {/* Row 3 */}
      <rect x="32" y="130" width="26" height="28" rx="4" fill="#a78bfa" />
      <rect x="64" y="132" width="20" height="26" rx="4" fill="#f87171" />
      <rect x="90" y="128" width="32" height="30" rx="4" fill="#fbbf24" />
      <rect x="128" y="130" width="24" height="28" rx="4" fill="#34d399" />

      {/* Owner person */}
      <circle cx="240" cy="80" r="22" fill="#fdba74" />
      <rect x="218" y="108" width="44" height="60" rx="10" fill="#F97316" />
      <rect x="208" y="118" width="18" height="36" rx="8" fill="#F97316" />
      <rect x="234" y="118" width="18" height="36" rx="8" fill="#F97316" />
      <rect x="220" y="158" width="14" height="30" rx="6" fill="#ea580c" />
      <rect x="238" y="158" width="14" height="30" rx="6" fill="#ea580c" />

      {/* Laptop / dashboard in hand area */}
      <rect x="256" y="128" width="56" height="38" rx="6" fill="#1f2937" />
      <rect x="259" y="131" width="50" height="28" rx="4" fill="#111827" />
      {/* Dashboard on screen */}
      <rect x="262" y="134" width="44" height="6" rx="2" fill="#F97316" opacity="0.8" />
      <rect x="262" y="143" width="20" height="4" rx="2" fill="#6ee7b7" />
      <rect x="285" y="143" width="14" height="4" rx="2" fill="#60a5fa" />
      <rect x="262" y="150" width="30" height="4" rx="2" fill="#fbbf24" />
      <rect x="295" y="150" width="11" height="4" rx="2" fill="#f87171" />

      {/* Notification bubble */}
      <rect x="316" y="50" width="150" height="64" rx="12" fill="white" />
      <polygon points="326,114 336,114 326,124" fill="white" />
      {/* WhatsApp icon style */}
      <circle cx="340" cy="82" r="14" fill="#22c55e" />
      <path d="M334 82 Q334 76 340 76 Q346 76 346 82 Q346 86 343 88 L344 91 L341 89 Q340 89 340 89 Q334 89 334 82Z" fill="white" />
      <rect x="360" y="70" width="92" height="7" rx="3.5" fill="#111827" />
      <rect x="360" y="81" width="70" height="6" rx="3" fill="#6b7280" />
      <rect x="360" y="91" width="55" height="5" rx="2.5" fill="#d1d5db" />

      {/* Lead count badge */}
      <circle cx="430" cy="45" r="18" fill="#F97316" />
      <text x="430" y="51" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">3</text>

      {/* Arrow from notification to owner */}
      <path d="M316 82 Q300 100 278 120" stroke="#F97316" strokeWidth="2" strokeDasharray="5 4" />
    </svg>
  );
}
