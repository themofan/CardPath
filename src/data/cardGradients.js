/**
 * Card gradient definitions for visual card backgrounds.
 * Each entry: { colors: string[], start: {x,y}, end: {x,y}, locations?: number[] }
 * Compatible with expo-linear-gradient's LinearGradient props.
 */

const cardGradients = {
  // ── Discover ──────────────────────────────────────────────
  'discover-it-student': {
    colors: ['#FF6B00', '#FF9A44'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'discover-it-secured': {
    colors: ['#E05500', '#FF7A1A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'discover-it-chrome': {
    colors: ['#C0C0C0', '#8A8A8A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Capital One ───────────────────────────────────────────
  'capital-one-journey': {
    colors: ['#004977', '#006DAA'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-platinum-secured': {
    colors: ['#7B8794', '#A0AAB4'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-savor-one': {
    colors: ['#003049', '#005A8D'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-venture-one': {
    colors: ['#1A1A2E', '#2D3A5C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-venture': {
    colors: ['#1B1B2F', '#3D2C5E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-venture-x': {
    colors: ['#0D0D0D', '#1A1A2E', '#2D1B4E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'capital-one-savor': {
    colors: ['#004977', '#003352'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Chase ─────────────────────────────────────────────────
  'chase-freedom-rise': {
    colors: ['#1A5276', '#2E86C1'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-freedom-unlimited': {
    colors: ['#003A63', '#00618A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-freedom-flex': {
    colors: ['#0E4D6C', '#1A7DAA'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-sapphire-preferred': {
    colors: ['#0B3D6B', '#1A5B9C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-sapphire-reserve': {
    colors: ['#0A1628', '#1A3A5C', '#0D2240'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-ink-preferred': {
    colors: ['#1A1A2E', '#2D3A5C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-ink-unlimited': {
    colors: ['#2C3E50', '#4A6274'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── American Express ──────────────────────────────────────
  'amex-blue-cash-everyday': {
    colors: ['#1565C0', '#42A5F5'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-blue-cash-preferred': {
    colors: ['#0D47A1', '#1976D2'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-everyday': {
    colors: ['#2196F3', '#64B5F6'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-green': {
    colors: ['#1B5E20', '#388E3C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-gold': {
    colors: ['#B8860B', '#DAA520', '#C5961E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-platinum': {
    colors: ['#8C8C8C', '#B8B8B8', '#A0A0A0'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-centurion': {
    colors: ['#0A0A0A', '#1A1A1A', '#2D2D2D'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-business-gold': {
    colors: ['#9C7A1A', '#C9A84C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Citi ──────────────────────────────────────────────────
  'citi-custom-cash': {
    colors: ['#003B70', '#005AA7'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'citi-double-cash': {
    colors: ['#00508F', '#0071BC'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'citi-premier': {
    colors: ['#1A1A2E', '#003B70'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'citi-strata-premier': {
    colors: ['#0D1B2A', '#1B3A5C'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'citi-secured': {
    colors: ['#003B70', '#4A7DAA'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Bank of America ───────────────────────────────────────
  'boa-customized-cash': {
    colors: ['#012169', '#1A3F8F'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'boa-premium-rewards': {
    colors: ['#4A0E0E', '#8B1A1A', '#6B1010'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'bofa-cash-secured': {
    colors: ['#012169', '#2A4DA1'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Wells Fargo ───────────────────────────────────────────
  'wells-fargo-active-cash': {
    colors: ['#CD1409', '#E8382B'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'wells-fargo-autograph': {
    colors: ['#B01010', '#D42020'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'wells-fargo-reflect': {
    colors: ['#CD1409', '#FF6B5A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'wells-fargo-autograph-journey': {
    colors: ['#8B0000', '#CD1409'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── U.S. Bank ─────────────────────────────────────────────
  'us-bank-altitude-go': {
    colors: ['#D71E28', '#B01820'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'usbank-altitude-connect': {
    colors: ['#8B0000', '#D71E28'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Other ─────────────────────────────────────────────────
  'apple-card': {
    colors: ['#F5F5F7', '#E0E0E0', '#D4D4D8'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'bilt-rewards': {
    colors: ['#0A0A0A', '#1C1C1E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },

  // ── Cobrands (inactive but still need visuals) ────────────
  'amazon-prime-visa': {
    colors: ['#131921', '#232F3E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'costco-anywhere-visa': {
    colors: ['#E31837', '#00529B'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-hilton-honors': {
    colors: ['#003366', '#00508F'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'amex-hilton-surpass': {
    colors: ['#1A1A2E', '#3D2C5E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'hilton-aspire': {
    colors: ['#104C97', '#1A6FD4'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-marriott-bonvoy-bold': {
    colors: ['#8A1538', '#B0203E'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'marriott-bonvoy-boundless': {
    colors: ['#6B1030', '#8A1538'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'marriott-bonvoy-brilliant': {
    colors: ['#4A0A24', '#8A1538', '#6B1030'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'world-of-hyatt': {
    colors: ['#84754E', '#A08C5A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'ihg-one-rewards-premier': {
    colors: ['#3B7D23', '#52A832'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'delta-skymiles-blue': {
    colors: ['#003A70', '#005AA7'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'delta-skymiles-gold': {
    colors: ['#86721C', '#B8960A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'delta-skymiles-platinum': {
    colors: ['#4A0E4A', '#6A1B9A'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'delta-skymiles-reserve': {
    colors: ['#0D0020', '#1B0040', '#2A0060'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'southwest-rapid-rewards-plus': {
    colors: ['#304CB2', '#4060D4'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'southwest-rapid-rewards-priority': {
    colors: ['#1A2E80', '#304CB2'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'chase-united-explorer': {
    colors: ['#002244', '#003D6B'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
  'citi-aadvantage-executive': {
    colors: ['#0078D2', '#005AA0'],
    start: { x: 0, y: 0 }, end: { x: 1, y: 1 },
  },
};

export function getCSSGradient(cardId) {
  const g = cardGradients[cardId];
  if (!g) return null;
  const angle = Math.round(Math.atan2(g.end.x - g.start.x, g.end.y - g.start.y) * (180 / Math.PI) + 180);
  return `linear-gradient(${angle}deg, ${g.colors.join(', ')})`;
}

export default cardGradients;
