import { glassUnitsForLine } from "@/lib/glass";
import type { DoorLine } from "@/types";

/**
 * Simple technical illustration of a two-panel sliding door.
 * `detail` adds dimension lines and per-panel glass sizes (production print).
 */
export function DoorDrawing({
  line,
  detail = false,
  className,
}: {
  line: DoorLine;
  detail?: boolean;
  className?: string;
}) {
  const pad = detail ? 74 : 28;
  const maxW = 720;
  const ratio = line.height / line.width;
  const drawW = maxW;
  const drawH = Math.round(maxW * ratio);
  const vbW = drawW + pad * 2;
  const vbH = drawH + pad * 2;
  const half = drawW / 2;
  const activeLeft = line.activeSide === "L";
  const glass = glassUnitsForLine(line);

  const arrow = (cx: number, dir: -1 | 1) => {
    const y = pad + drawH / 2;
    const len = half * 0.34;
    const x1 = cx - (dir * len) / 2;
    const x2 = cx + (dir * len) / 2;
    return (
      <g stroke="currentColor" strokeWidth={3} className="text-accent" fill="none">
        <line x1={x1} y1={y} x2={x2} y2={y} />
        <polyline points={`${x2 - dir * 14},${y - 10} ${x2},${y} ${x2 - dir * 14},${y + 10}`} />
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={className}
      role="img"
      aria-label={`Two-panel sliding door ${line.width} by ${line.height} mm, active side ${
        activeLeft ? "left" : "right"
      }`}
    >
      {/* outer frame */}
      <rect
        x={pad}
        y={pad}
        width={drawW}
        height={drawH}
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        className="text-foreground"
      />
      {/* panels */}
      {[0, 1].map((i) => {
        const x = pad + i * half;
        const isActive = activeLeft ? i === 0 : i === 1;
        return (
          <g key={i}>
            <rect
              x={x + 10}
              y={pad + 10}
              width={half - 20}
              height={drawH - 20}
              fill="none"
              stroke="currentColor"
              strokeWidth={isActive ? 5 : 3}
              className={isActive ? "text-accent" : "text-muted-foreground"}
            />
            <rect
              x={x + 28}
              y={pad + 28}
              width={half - 56}
              height={drawH - 56}
              className="fill-primary/5 stroke-border"
              strokeWidth={2}
            />
            {isActive && arrow(x + half / 2, activeLeft ? 1 : -1)}
            {detail && (
              <text
                x={x + half / 2}
                y={pad + drawH / 2 + 46}
                textAnchor="middle"
                className="fill-foreground"
                fontSize={22}
                fontWeight={600}
              >
                {glass[i]!.width} × {glass[i]!.height}
              </text>
            )}
            {detail && (
              <text
                x={x + half / 2}
                y={pad + drawH / 2 + 74}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={18}
              >
                {isActive ? "ACTIVE panel glass" : "FIXED panel glass"}
              </text>
            )}
          </g>
        );
      })}
      {/* threshold line */}
      <line
        x1={pad}
        y1={pad + drawH}
        x2={pad + drawW}
        y2={pad + drawH}
        stroke="currentColor"
        strokeWidth={10}
        className="text-primary"
      />

      {detail && (
        <g className="text-foreground" fontSize={24} fontWeight={600}>
          {/* width dimension */}
          <line
            x1={pad}
            y1={pad + drawH + 40}
            x2={pad + drawW}
            y2={pad + drawH + 40}
            stroke="currentColor"
            strokeWidth={2}
          />
          <text x={pad + drawW / 2} y={pad + drawH + 66} textAnchor="middle" fill="currentColor">
            {line.width} mm overall width
          </text>
          {/* height dimension */}
          <line
            x1={pad - 36}
            y1={pad}
            x2={pad - 36}
            y2={pad + drawH}
            stroke="currentColor"
            strokeWidth={2}
          />
          <text
            x={pad - 46}
            y={pad + drawH / 2}
            textAnchor="middle"
            fill="currentColor"
            transform={`rotate(-90 ${pad - 46} ${pad + drawH / 2})`}
          >
            {line.height} mm overall height
          </text>
        </g>
      )}
    </svg>
  );
}
