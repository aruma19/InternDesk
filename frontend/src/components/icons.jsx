// Satu set ikon garis (stroke) sederhana supaya tampilan navigasi konsisten
// dan tidak bergantung pada dukungan emoji/glyph di tiap perangkat.
const base = {
  width: 19,
  height: 19,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export function IconTable(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M9.5 10v9.5" />
    </svg>
  );
}

export function IconDoc(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18h4" />
    </svg>
  );
}

export function IconUserPlus(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.5" cy="8.5" r="3.25" />
      <path d="M3.75 19c.7-3 3-4.5 5.75-4.5s5.05 1.5 5.75 4.5" />
      <path d="M18.5 8.5v5.5M15.75 11.25h5.5" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 20.5H5.5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1H9" />
      <path d="M15.5 16 20 12l-4.5-4" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function IconChevronLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </svg>
  );
}
