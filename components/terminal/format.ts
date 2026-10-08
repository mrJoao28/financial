export const fmtNumber = (v: number | null, digits = 2) =>
    v === null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtSigned = (v: number | null, digits = 2) =>
    v === null ? '—' : `${v > 0 ? '+' : ''}${fmtNumber(v, digits)}`;

export const fmtPercent = (v: number | null, digits = 2) =>
    v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`;

export const changeColor = (v: number | null) =>
    v === null || v === 0 ? 'text-gray-400' : v > 0 ? 'text-teal-400' : 'text-red-500';

export const fmtClock = (unixSeconds: number | null) =>
    unixSeconds === null
        ? '—'
        : new Date(unixSeconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
