"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function MonthSelector({ value, onChange }: Props) {
  const options: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const label = (v: string) => {
    const [y, m] = v.split("-");
    return `${y}年${parseInt(m)}月`;
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((o) => (
        <option key={o} value={o}>{label(o)}</option>
      ))}
    </select>
  );
}
