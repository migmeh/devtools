import React from 'react';

// Iconos SVG inline (stroke-based, consistentes): viewBox 24x24, strokeWidth 1.5.
// Reglas .clinerules: priorizar SVG , acceso aria, sin emojis en UI.
const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  className: 'w-4 h-4 inline-block',
};

export const CheckIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Aceptado'} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const WarningIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Advertencia'} {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const FolderIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Carpeta'} {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const BulbIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Consejo'} {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
  </svg>
);

export const CloseIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Cerrar'} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const InfoIcon = (props) => (
  <svg {...baseProps} role="img" aria-label={props['aria-label'] || 'Información'} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);