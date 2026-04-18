"use client";

interface Props {
  activeWeek: number;
  onChange: (w: number) => void;
}

const labels = ["1週目", "2週目", "3週目", "4週目", "5週目"];

export function WeekTabs({ activeWeek, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {labels.map((label, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeWeek === i
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
