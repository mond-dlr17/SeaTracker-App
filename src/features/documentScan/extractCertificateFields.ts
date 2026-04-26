import dayjs from 'dayjs';

export type ExtractedCertificateFields = {
  name?: string;
  issueDate?: string;
  expiryDate?: string;
};

const ISSUE_HINT = /issue|issued|valid\s*from|effective|date\s*of\s*issue|date\s*of\s*training/i;
const EXPIRY_HINT = /expir|expires|valid\s*(until|thru|through)|expiration|exp\.?\s*date|renew/i;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function toIso(y: number, month: number, day: number): string | null {
  const iso = `${y}-${pad2(month)}-${pad2(day)}`;
  if (!dayjs(iso).isValid()) return null;
  return iso;
}

/** Parse numeric date parts; ambiguous m/d vs d/m defaults to day-first (common on maritime docs). */
function partsToIso(a: number, b: number, rawYear: number): string | null {
  let y = rawYear;
  if (y < 100) y += y >= 70 ? 1900 : 2000;

  let day: number;
  let month: number;
  if (a > 12) {
    day = a;
    month = b;
  } else if (b > 12) {
    month = a;
    day = b;
  } else {
    day = a;
    month = b;
  }
  return toIso(y, month, day);
}

function tryParseDateToken(raw: string): string | null {
  const s = raw.trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (dmy) return partsToIso(Number(dmy[1]), Number(dmy[2]), Number(dmy[3]));

  return null;
}

function firstDateInLine(line: string): string | null {
  const iso = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return tryParseDateToken(iso[1]);

  const dmy = line.match(/\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\b/);
  if (dmy) return tryParseDateToken(dmy[1]);

  return null;
}

function collectLines(fullText: string): string[] {
  return fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function uniqueSortedDates(isos: string[]): string[] {
  const uniq = [...new Set(isos)].filter((d) => dayjs(d).isValid());
  uniq.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
  return uniq;
}

const NAME_KEYWORDS =
  /certificate|competence|training|course|license|licence|endorsement|stcw|basic\s*safety|document|credential|qualification/i;

function pickName(lines: string[], skipContainsDateOnly: Set<number>): string | undefined {
  for (let i = 0; i < lines.length; i++) {
    if (skipContainsDateOnly.has(i)) continue;
    const l = lines[i];
    if (l.length < 6) continue;
    if (NAME_KEYWORDS.test(l)) return l.slice(0, 200);
  }

  for (let i = 0; i < lines.length; i++) {
    if (skipContainsDateOnly.has(i)) continue;
    const l = lines[i];
    if (l.length < 12) continue;
    if (/^\d[\d\s/-]*$/.test(l)) continue;
    const letters = (l.match(/[a-zA-Z]/g) ?? []).length;
    if (letters < Math.max(4, l.length * 0.25)) continue;
    if (firstDateInLine(l) && l.length < 28) continue;
    return l.slice(0, 200);
  }

  return undefined;
}

/**
 * Best-effort parsing of certificate / ID OCR into vault fields (ISO dates).
 */
export function extractCertificateFieldsFromOcr(fullText: string): ExtractedCertificateFields {
  const lines = collectLines(fullText);
  const markedLines = new Set<number>();

  let issueDate: string | undefined;
  let expiryDate: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const d = firstDateInLine(line);
    if (!d) continue;

    const ctx = `${line} ${lines[i + 1] ?? ''} ${lines[i - 1] ?? ''}`;
    if (EXPIRY_HINT.test(ctx) || EXPIRY_HINT.test(line)) {
      expiryDate = d;
      markedLines.add(i);
      continue;
    }
    if (ISSUE_HINT.test(ctx) || ISSUE_HINT.test(line)) {
      issueDate = d;
      markedLines.add(i);
    }
  }

  const allDates: string[] = [];
  for (const line of lines) {
    const iso = /\b(\d{4}-\d{2}-\d{2})\b/g;
    let m: RegExpExecArray | null;
    while ((m = iso.exec(line))) {
      const p = tryParseDateToken(m[1]);
      if (p) allDates.push(p);
    }
    const dmy = /\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\b/g;
    while ((m = dmy.exec(line))) {
      const p = tryParseDateToken(m[1]);
      if (p) allDates.push(p);
    }
  }

  const sorted = uniqueSortedDates(allDates);

  if (!issueDate && !expiryDate && sorted.length >= 2) {
    issueDate = sorted[0];
    expiryDate = sorted[sorted.length - 1];
  } else if (!issueDate && sorted.length >= 1 && !expiryDate) {
    issueDate = sorted[0];
  } else if (!expiryDate && sorted.length >= 1 && !issueDate) {
    expiryDate = sorted[sorted.length - 1];
  } else if (!issueDate && sorted.length >= 2 && expiryDate) {
    const before = sorted.filter((d) => dayjs(d).isBefore(dayjs(expiryDate)));
    issueDate = before[0] ?? sorted[0];
  } else if (!expiryDate && sorted.length >= 2 && issueDate) {
    const after = sorted.filter((d) => dayjs(d).isAfter(dayjs(issueDate)));
    expiryDate = after[after.length - 1] ?? sorted[sorted.length - 1];
  }

  const skipForName = new Set<number>();
  for (const i of markedLines) skipForName.add(i);
  for (let i = 0; i < lines.length; i++) {
    const d = firstDateInLine(lines[i]);
    if (d && lines[i].length < 36) skipForName.add(i);
  }

  const name = pickName(lines, skipForName);

  return { name, issueDate, expiryDate };
}
