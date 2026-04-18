"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MonthSelector } from "@/components/month-selector";
import { ExcelTable } from "@/components/excel-table";
import { AIAnalysis } from "@/components/ai-analysis";
import { IssueForm } from "@/components/issue-form";
import { WeekTabs } from "@/components/week-tabs";
import {
  type MemberMonthData,
  type MonthlyManagement,
  type MonthlyGoals,
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

  useEffect(() => {
    const key = getStorageKey(name, month);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MemberMonthData;
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

  const save = useCallback(() => {
    const key = getStorageKey(name, month);
    localStorage.setItem(key, JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [name, month, data]);

  // Proxy handlers that also update goals/monthly in ExcelTable
  const handleGoalsChange = (goals: MonthlyGoals) => setData({ ...data, goals });
  const handleMonthlyChange = (monthly: MonthlyManagement) => setData({ ...data, monthly });

  if (!MEMBERS.includes(name)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">メンバーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700">
              ← チーム一覧
            </button>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <MonthSelector value={month} onChange={setMonth} />
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald-600 animate-pulse">保存しました</span>}
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
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              保存
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Excel-style Table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ExcelTable
            memberName={name}
            month={month}
            weeks={data.weeks}
            goals={data.goals}
            monthly={data.monthly}
            onWeekChange={(i, w) => {
              const weeks = [...data.weeks];
              weeks[i] = w;
              setData({ ...data, weeks });
            }}
            onGoalsChange={(g) => setData({ ...data, goals: g })}
            onMonthlyChange={(m) => setData({ ...data, monthly: m })}
          />
        </section>

        {/* Issues Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">目標・結果・課題・改善案</h2>
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

        {/* AI Analysis Chat */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🤖 AI数字分析・改善コーチング
          </h2>
          <AIAnalysis memberName={name} data={data} />
        </section>
      </main>
    </div>
  );
}
