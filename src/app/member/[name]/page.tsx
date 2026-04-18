"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "@/components/month-selector";
import { WeekTabs } from "@/components/week-tabs";
import { WeeklyForm } from "@/components/weekly-form";
import { GoalsForm } from "@/components/goals-form";
import { ProgressBars } from "@/components/progress-bars";
import { MonthlyManagementForm } from "@/components/monthly-management";
import { IssueForm } from "@/components/issue-form";
import {
  type MemberMonthData,
  emptyMemberMonth,
  emptyWeek,
  emptyIssue,
  getStorageKey,
  MEMBERS,
} from "@/lib/types";

export default function MemberPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(params.name as string);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);
  const [activeWeek, setActiveWeek] = useState(0);
  const [data, setData] = useState<MemberMonthData>(structuredClone(emptyMemberMonth));
  const [saved, setSaved] = useState(false);

  // Load data
  useEffect(() => {
    const key = getStorageKey(name, month);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MemberMonthData;
        // Ensure arrays have 5 elements
        while (parsed.weeks.length < 5) parsed.weeks.push({ ...emptyWeek });
        while (parsed.issues.length < 5) parsed.issues.push({ ...emptyIssue });
        setData(parsed);
      } catch {
        setData(structuredClone(emptyMemberMonth));
      }
    } else {
      setData(structuredClone(emptyMemberMonth));
    }
  }, [name, month]);

  // Save data
  const save = useCallback(() => {
    const key = getStorageKey(name, month);
    localStorage.setItem(key, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [name, month, data]);

  const monthLabel = (() => {
    const [y, m] = month.split("-");
    return `${y}年${parseInt(m)}月`;
  })();

  if (!MEMBERS.includes(name)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">メンバーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← チーム一覧
            </button>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <MonthSelector value={month} onChange={setMonth} />
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald-600">保存しました</span>}
            <select
              value={name}
              onChange={(e) => router.push(`/member/${encodeURIComponent(e.target.value)}`)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
            >
              {MEMBERS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              onClick={save}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Section A: Goals */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            月次目標（{monthLabel}）
          </h2>
          <GoalsForm goals={data.goals} onChange={(g) => setData({ ...data, goals: g })} />
        </section>

        {/* Section B: Progress */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">目標 vs 実績</h2>
          <ProgressBars goals={data.goals} weeks={data.weeks} />
        </section>

        {/* Section C: Weekly Input */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">週次データ入力</h2>
          </div>
          <div className="px-6">
            <WeekTabs activeWeek={activeWeek} onChange={setActiveWeek} />
          </div>
          <div className="p-6">
            <WeeklyForm
              data={data.weeks[activeWeek]}
              onChange={(w) => {
                const weeks = [...data.weeks];
                weeks[activeWeek] = w;
                setData({ ...data, weeks });
              }}
            />
          </div>
        </section>

        {/* Section D: Monthly Management */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">月次管理（稼働数・退職・入社）</h2>
          <MonthlyManagementForm
            data={data.monthly}
            onChange={(m) => setData({ ...data, monthly: m })}
          />
        </section>

        {/* Section E: Issues + AI */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              目標・結果・課題・改善案（{activeWeek + 1}週目）
            </h2>
          </div>
          <div className="px-6">
            <WeekTabs activeWeek={activeWeek} onChange={setActiveWeek} />
          </div>
          <div className="p-6">
            <IssueForm
              weekIndex={activeWeek}
              issue={data.issues[activeWeek]}
              onChange={(issue) => {
                const issues = [...data.issues];
                issues[activeWeek] = issue;
                setData({ ...data, issues });
              }}
              memberName={name}
              allData={data}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
