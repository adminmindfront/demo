const ICONS = {
  camera: `
    <path d="M4 8h4l2-2h4l2 2h4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"></path>
    <circle cx="12" cy="13" r="3.5"></circle>
  `,
  map: `
    <path d="M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20V6.5Z"></path>
    <path d="M8.5 4v13.5"></path>
    <path d="M15.5 6.5V20"></path>
  `,
  ticket: `
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path>
    <path d="M12 7v10"></path>
  `,
  "message-circle": `
    <path d="M7 18 3 21v-5a8.5 8.5 0 1 1 4 2Z"></path>
  `,
  user: `
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M4 20a8 8 0 0 1 16 0"></path>
  `,
  "qr-code": `
    <rect x="4" y="4" width="5" height="5"></rect>
    <rect x="15" y="4" width="5" height="5"></rect>
    <rect x="4" y="15" width="5" height="5"></rect>
    <path d="M15 15h2v2h-2zM19 15h1v5h-5v-1"></path>
    <path d="M11 5h2M11 9h4M11 12h2M14 12h2M11 15h2M11 18h4"></path>
  `,
  "credit-card": `
    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
    <path d="M3 10h18"></path>
    <path d="M7 15h3"></path>
  `,
  "chevron-right": `
    <path d="m9 6 6 6-6 6"></path>
  `,
  award: `
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M8.5 12.5 7 20l5-3 5 3-1.5-7.5"></path>
  `,
  "shopping-cart": `
    <circle cx="9" cy="19" r="1.5"></circle>
    <circle cx="17" cy="19" r="1.5"></circle>
    <path d="M4 5h2l2.2 9h8.9l2-7H7.1"></path>
  `,
  x: `
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  `,
  send: `
    <path d="M22 2 11 13"></path>
    <path d="m22 2-7 20-4-9-9-4 20-7Z"></path>
  `,
  globe: `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M3 12h18"></path>
    <path d="M12 3a14 14 0 0 1 0 18"></path>
    <path d="M12 3a14 14 0 0 0 0 18"></path>
  `,
  "check-circle": `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="m8.5 12 2.5 2.5 4.5-5"></path>
  `,
  "scan-line": `
    <path d="M4 7V5h2"></path>
    <path d="M18 5h2v2"></path>
    <path d="M20 17v2h-2"></path>
    <path d="M6 19H4v-2"></path>
    <path d="M5 12h14"></path>
  `,
  bone: `
    <path d="M7.2 8.2a2.5 2.5 0 1 1-3.5-3.5 2.5 2.5 0 1 1 3.5 3.5l5.1 5.1a2.5 2.5 0 1 1 3.5 3.5 2.5 2.5 0 1 1-3.5 3.5 2.5 2.5 0 1 1-3.5-3.5Z"></path>
  `,
};

export function renderIcon(name, options = {}) {
  const { className = "", size = 24 } = options;
  const svg = ICONS[name] || "";

  return `
    <svg
      class="icon ${className}"
      xmlns="http://www.w3.org/2000/svg"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      ${svg}
    </svg>
  `;
}
