import { useRef, useState } from 'react';
import { formatBRL } from '@/lib/formatters';
import type { SalesPoint } from '@/types/affiliate';

interface Pt {
  x: number;
  y: number;
}

/** Curva suave (Catmull-Rom → bézier cúbica). */
function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function label(date: string): string {
  const dt = new Date(`${date}T12:00:00`);
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function fullDate(date: string): string {
  const dt = new Date(`${date}T12:00:00`);
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function RevenueChart({ data }: { data: SalesPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (!data.length) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Sem vendas ainda.</div>;
  }

  const W = 800;
  const H = 220;
  const padL = 6;
  const padR = 6;
  const padT = 12;
  const padB = 24;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const n = data.length;
  const max = Math.max(...data.map((d) => d.total), 1);

  const xOf = (i: number) => padL + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const yOf = (v: number) => padT + (1 - v / max) * ih;
  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.total) }));
  const line = smoothPath(pts);
  const bottom = padT + ih;
  const area = `${line} L ${pts[n - 1].x.toFixed(1)} ${bottom} L ${pts[0].x.toFixed(1)} ${bottom} Z`;

  const grid = [0.25, 0.5, 0.75, 1].map((f) => padT + f * ih);
  const step = Math.max(1, Math.round(n / 6));
  const labels = data
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % step === 0 || i === n - 1);

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    let idx = n === 1 ? 0 : Math.round(((vx - padL) / iw) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  }

  const hp = hover != null ? pts[hover] : null;
  const hd = hover != null ? data[hover] : null;

  // caixa do tooltip: centraliza no ponto, mas clampa dentro do gráfico
  const tw = 152;
  const th = 48;
  const boxX = hp ? Math.max(padL, Math.min(W - padR - tw, hp.x - tw / 2)) : 0;
  const boxY = hp ? (hp.y - th - 14 < 2 ? hp.y + 14 : hp.y - th - 14) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      role="img"
      aria-label="Faturamento por dia"
    >
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>

      {grid.map((y, i) => (
        <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      <path d={area} fill="url(#revFill)" />
      <path d={line} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {labels.map(({ i, d }) => (
        <text
          key={i}
          x={xOf(i)}
          y={H - 6}
          textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
          fill="rgba(255,255,255,0.4)"
          fontSize="11"
        >
          {label(d.date)}
        </text>
      ))}

      {hp && hd && (
        <g pointerEvents="none">
          <line
            x1={hp.x}
            y1={padT}
            x2={hp.x}
            y2={bottom}
            stroke="rgba(34,211,238,0.4)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx={hp.x} cy={hp.y} r="7" fill="#22d3ee" opacity="0.18" />
          <circle cx={hp.x} cy={hp.y} r="3.5" fill="#22d3ee" stroke="#0b1220" strokeWidth="1.5" />
          <rect
            x={boxX}
            y={boxY}
            width={tw}
            height={th}
            rx="8"
            fill="rgba(2,6,23,0.96)"
            stroke="rgba(255,255,255,0.14)"
          />
          <text
            x={boxX + tw / 2}
            y={boxY + 19}
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
          >
            {fullDate(hd.date)}
          </text>
          <text
            x={boxX + tw / 2}
            y={boxY + 38}
            textAnchor="middle"
            fill="#e6f8fc"
            fontSize="15"
            fontWeight="700"
          >
            {formatBRL(hd.total)}
          </text>
        </g>
      )}

      {/* camada invisível no topo captura o mouse em qualquer ponto do gráfico */}
      <rect
        x="0"
        y="0"
        width={W}
        height={H}
        fill="transparent"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      />
    </svg>
  );
}
