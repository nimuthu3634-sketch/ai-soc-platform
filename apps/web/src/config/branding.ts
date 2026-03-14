export const branding = {
  appName: import.meta.env.VITE_APP_NAME || 'Aegis Core',
  tagline: 'AI-Integrated SOC',
  logoPath: import.meta.env.VITE_LOGO_PATH || '/branding/aegiscore-logo.svg',
  markPath: '/branding/aegiscore-mark.svg',
  proposalCoverReference:
    import.meta.env.VITE_PROPOSAL_COVER_REFERENCE || 'docs/branding/proposal-cover.png',
  accentHex: '#ff7a1a',
  theme: {
    backgroundHex: '#070b12',
    surfaceHex: '#101827',
    surfaceElevatedHex: '#172235',
    surfaceMutedHex: '#1e2b44',
    textHex: '#f8fafc',
    mutedHex: '#94a3b8',
    accentSoftHex: '#ffb275',
  },
} as const;
