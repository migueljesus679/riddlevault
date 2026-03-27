export const colors = {
  parchment: '#f4e4ba',
  parchmentDark: '#d4c49a',
  gold: '#c9a84c',
  goldLight: '#e0c872',
  goldDim: '#8a7333',
  darkBrown: '#2d1810',
  darkBrownLight: '#3d2820',
  forestGreen: '#1a2e1a',
  forestGreenLight: '#2a4e2a',
  midnightBlue: '#1a1a2e',
  midnightBlueLight: '#2a2a4e',
  ember: '#8b4513',
  emberLight: '#a0522d',
  mithril: '#c0c0c0',
  mithrilDark: '#808080',
  shadowBlack: '#0d0d0d',
  error: '#8b2020',
  success: '#2a6e2a',
} as const;

export const fonts = {
  heading: "'Cinzel', serif",
  body: "'Crimson Text', serif",
  code: "'Fira Code', monospace",
} as const;

export const shadows = {
  card: '0 4px 20px rgba(13, 13, 13, 0.6)',
  cardHover: '0 8px 30px rgba(201, 168, 76, 0.15)',
  glow: '0 0 15px rgba(201, 168, 76, 0.3)',
  glowStrong: '0 0 25px rgba(201, 168, 76, 0.5)',
  inner: 'inset 0 2px 8px rgba(13, 13, 13, 0.4)',
} as const;

export const borders = {
  gold: `1px solid ${colors.gold}`,
  goldDim: `1px solid ${colors.goldDim}`,
  subtle: `1px solid rgba(201, 168, 76, 0.2)`,
} as const;
