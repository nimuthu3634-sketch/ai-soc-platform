type ChartTooltipEntry = {
  color?: string;
  name?: string;
  value?: string | number;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
  labelFormatter?: (value: string | number) => string;
  valueFormatter?: (value: string | number, name: string) => string;
  nameFormatter?: (name: string) => string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  nameFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-white/10 bg-slate-950/95 px-4 py-3 shadow-2xl backdrop-blur">
      {label !== undefined ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {payload.map((entry) => {
          const name = entry.name ?? 'Value';
          const value = entry.value ?? 0;

          return (
            <div
              className="flex items-center justify-between gap-4 text-sm"
              key={name}
            >
              <span className="inline-flex items-center gap-2 text-slate-200">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color ?? '#94a3b8' }}
                />
                {nameFormatter ? nameFormatter(name) : name}
              </span>
              <span className="font-semibold text-white">
                {valueFormatter ? valueFormatter(value, name) : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
