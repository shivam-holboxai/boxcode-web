export function Mark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      className={`mark-art ${className}`}
      viewBox="0 0 13 9.68"
      aria-hidden="true"
      focusable="false"
    >
      <g className="ears">
        <path d="M.5 0H2.5V.84H3V1.68H0V.84H.5Z" />
        <path d="M10.5 0H12.5V.84H13V1.68H10V.84H10.5Z" />
      </g>
      <path d="M0 2H13V2.84H12.5V3.68H.5V2.84H0Z" />
      <rect y="4" width="2" height="1.68" />
      <rect x="4" y="4" width="5" height="1.68" />
      <rect x="11" y="4" width="2" height="1.68" />
      <path d="M0 6H13V6.84H12.5V7.68H.5V6.84H0Z" />
      <g className="legs">
        <path d="M2 8H5V8.84H4.5V9.68H2.5V8.84H2Z" />
        <path d="M8 8H11V8.84H10.5V9.68H8.5V8.84H8Z" />
      </g>
      <g className="eyes">
        <rect x="2" y="4" width="2" height="1.68" />
        <rect x="9" y="4" width="2" height="1.68" />
      </g>
    </svg>
  );
}
