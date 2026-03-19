import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type CertificateIoniconsName = NonNullable<ComponentProps<typeof Ionicons>['name']>;

/** Known STCW / maritime certificate labels → Ionicons glyph names (Ionicons v5+). */
export const CERT_ICONS = {
  'Basic Safety Training': 'shield-checkmark',
  PST: 'boat',
  FPFF: 'flame',
  EFA: 'medkit',
  PSSR: 'people',

  'Advanced Fire Fighting': 'flame-outline',
  PSC: 'boat-outline',
  'Medical First Aid': 'medkit-outline',
  'Medical Care': 'heart',

  'Radar Observer': 'radio',
  ARPA: 'analytics',
  ECDIS: 'map',
  BRM: 'people-circle',
  'OIC-NW': 'compass',

  ERM: 'settings',
  OICEW: 'construct',
  'High Voltage': 'flash',
  'Marine Diesel': 'cog',

  'Oil Tanker': 'water',
  'Chemical Tanker': 'flask',
  'Gas Tanker': 'cloud',

  GMDSS: 'wifi',
  SSO: 'shield',
  SSA: 'lock-closed',
} as const satisfies Record<string, CertificateIoniconsName>;

type CertIconKey = keyof typeof CERT_ICONS;

const DEFAULT_CERT_ICON: CertificateIoniconsName = 'ribbon';

/** Normalized display names → key in {@link CERT_ICONS} (covers common OCR / vault wording). */
const CERT_NAME_ALIASES: Record<string, CertIconKey> = {
  'stcw basic safety training': 'Basic Safety Training',
  'proficiency in survival craft': 'PST',
  'medical fitness certificate': 'Medical First Aid',
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if the key is a short code like `PST`, `OIC-NW` (match as a token, not substring). */
function isShortCertKey(key: string) {
  return key.length <= 8 && /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(key);
}

function nameMatchesCertKey(name: string, key: string): boolean {
  const n = normalizeName(name).toLowerCase();
  const k = key.toLowerCase();
  if (n === k) return true;
  if (n.includes(k)) return true;
  if (isShortCertKey(key)) {
    return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(key)}(?:[^a-z0-9]|$)`, 'i').test(name);
  }
  return false;
}

/**
 * Picks an Ionicons name for a certificate title: exact / alias / substring / short-code token, else default.
 */
export function getCertificateIoniconsName(name: string): CertificateIoniconsName {
  const normalized = normalizeName(name);
  if (!normalized) return DEFAULT_CERT_ICON;

  const alias = CERT_NAME_ALIASES[normalized.toLowerCase()];
  if (alias) return CERT_ICONS[alias];

  const keys = Object.keys(CERT_ICONS) as CertIconKey[];
  keys.sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (nameMatchesCertKey(normalized, key)) return CERT_ICONS[key];
  }

  return DEFAULT_CERT_ICON;
}
