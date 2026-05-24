export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 420, height: "auto" }}
      aria-hidden="true"
    >
      {/* Phone frame */}
      <rect x="60" y="20" width="300" height="440" rx="32" fill="#1a1a1a" />
      <rect x="68" y="28" width="284" height="424" rx="26" fill="#0f0f0f" />

      {/* Notch */}
      <rect x="160" y="28" width="100" height="14" rx="7" fill="#1a1a1a" />

      {/* Screen background — map-like */}
      <rect x="68" y="42" width="284" height="410" rx="26" fill="#e8f0f8" />

      {/* Map grid lines (subtle) */}
      {[80, 120, 160, 200, 240, 280, 320, 360, 400, 440].map((y) => (
        <line key={`h${y}`} x1="68" y1={y} x2="352" y2={y} stroke="#d0dce8" strokeWidth="1" />
      ))}
      {[90, 130, 170, 210, 250, 290, 330].map((x) => (
        <line key={`v${x}`} x1={x} y1="42" x2={x} y2="452" stroke="#d0dce8" strokeWidth="1" />
      ))}

      {/* Roads */}
      <rect x="68" y="210" width="284" height="8" rx="2" fill="#c8d8e8" />
      <rect x="195" y="42" width="8" height="410" rx="2" fill="#c8d8e8" />

      {/* Search bar at top */}
      <rect x="78" y="52" width="264" height="36" rx="10" fill="white" opacity="0.97" />
      <circle cx="100" cy="70" r="7" stroke="#F97316" strokeWidth="2" fill="none" />
      <line x1="105" y1="75" x2="109" y2="79" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <rect x="115" y="62" width="120" height="8" rx="4" fill="#e5e7eb" />
      <rect x="115" y="74" width="80" height="6" rx="3" fill="#f3f4f6" />

      {/* Map pins */}
      {/* Pin 1 — orange (selected) */}
      <g transform="translate(150, 155)">
        <circle cx="0" cy="0" r="18" fill="#F97316" opacity="0.15" />
        <circle cx="0" cy="-12" r="12" fill="#F97316" />
        <circle cx="0" cy="-12" r="5" fill="white" />
        <polygon points="0,2 -5,-8 5,-8" fill="#F97316" />
      </g>

      {/* Pin 2 — muted */}
      <g transform="translate(240, 200)">
        <circle cx="0" cy="-10" r="10" fill="#94a3b8" />
        <circle cx="0" cy="-10" r="4" fill="white" />
        <polygon points="0,2 -4,-6 4,-6" fill="#94a3b8" />
      </g>

      {/* Pin 3 — muted */}
      <g transform="translate(180, 260)">
        <circle cx="0" cy="-10" r="10" fill="#94a3b8" />
        <circle cx="0" cy="-10" r="4" fill="white" />
        <polygon points="0,2 -4,-6 4,-6" fill="#94a3b8" />
      </g>

      {/* Pin 4 — muted */}
      <g transform="translate(290, 160)">
        <circle cx="0" cy="-10" r="10" fill="#64748b" />
        <circle cx="0" cy="-10" r="4" fill="white" />
        <polygon points="0,2 -4,-6 4,-6" fill="#64748b" />
      </g>

      {/* Radius circle around pin 1 */}
      <circle cx="150" cy="143" r="60" stroke="#F97316" strokeWidth="1.5" strokeDasharray="5 4" fill="#F97316" fillOpacity="0.04" />

      {/* Shop result card (bottom sheet) */}
      <rect x="68" y="310" width="284" height="142" rx="20" fill="white" />
      <rect x="68" y="310" width="284" height="4" rx="2" fill="#e5e7eb" />

      {/* Drag handle */}
      <rect x="188" y="318" width="44" height="4" rx="2" fill="#d1d5db" />

      {/* Card 1 */}
      <rect x="82" y="332" width="256" height="52" rx="10" fill="#f9fafb" />
      <rect x="92" y="342" width="32" height="32" rx="8" fill="#FFF7ED" />
      <rect x="100" y="350" width="16" height="16" rx="3" fill="#F97316" opacity="0.5" />
      <rect x="132" y="346" width="90" height="8" rx="4" fill="#111827" />
      <rect x="132" y="360" width="60" height="6" rx="3" fill="#9ca3af" />
      <rect x="298" y="348" width="30" height="12" rx="4" fill="#F97316" />
      <rect x="301" y="351" width="24" height="6" rx="3" fill="white" />

      {/* Card 2 */}
      <rect x="82" y="390" width="256" height="52" rx="10" fill="#f9fafb" />
      <rect x="92" y="400" width="32" height="32" rx="8" fill="#f0fdf4" />
      <rect x="100" y="408" width="16" height="16" rx="3" fill="#22c55e" opacity="0.5" />
      <rect x="132" y="404" width="110" height="8" rx="4" fill="#111827" />
      <rect x="132" y="418" width="70" height="6" rx="3" fill="#9ca3af" />
      <rect x="298" y="406" width="30" height="12" rx="4" fill="#e5e7eb" />
      <rect x="301" y="409" width="24" height="6" rx="3" fill="#9ca3af" />

      {/* Bottom nav bar */}
      <rect x="68" y="426" width="284" height="26" rx="0" fill="white" />
      {[110, 170, 230, 290].map((x) => (
        <circle key={x} cx={x} cy="439" r="5" fill={x === 110 ? "#F97316" : "#d1d5db"} />
      ))}
    </svg>
  );
}
