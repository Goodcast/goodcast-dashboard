"use client";

import { useState } from "react";
import type { WeeklyIssue, MemberMonthData } from "@/lib/types";

interface Props {
  issues: WeeklyIssue[];
  onChange: (issues: WeeklyIssue[]) => void;
  memberName: string;
  allData: MemberMonthData;
}

const weekLabels = ["1週目", "2週目", "3週目", "4週目", "5週目"];

export function IssueTable({ issues, onChange, memberName, allData }: Props) {
  const [loading, setLoading] = useState<number | null>(null);

  const updateIssue = (i: number, field: keyof WeeklyIssue, value: string) => {
    const next = [...issues];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };

  const handleAI = async (weekIndex: number) => {
    setLoading(weekIndex);
    try {
      const issue = issues[weekIndex];
      const weekData = allData.weeks[weekIndex];
      const totals = allData.weeks.slice(0, weekIndex + 1).reduce(
        (acc, w) => ({
          callCount: acc.callCount + w.callCount,
          contactCount: acc.contactCount + w.contactCount,
          newApptGained: acc.newApptGained + w.newApptGained,
          newApptDone: acc.newApptDone + w.newApptDone,
          reApptDone: acc.reApptDone + w.reApptDone,
          orders: acc.orders + w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople,
        }),
        { callCount: 0, contactCount: 0, newApptGained: 0, newApptDone: 0, reApptDone: 0, orders: 0 }
      );

      const prompt = `あなたはベトナム人エンジニア派遣会社の営業マネージャーです。
以下の営業データと本人の課題認識をもとに、具体的で実行可能な改善案を3つ提案してください。

■ ${memberName} ${weekIndex + 1}週目データ
架電: ${weekData.callCount}件, 着電: ${weekData.contactCount}件, 着電率: ${weekData.callCount > 0 ? ((weekData.contactCount / weekData.callCount) * 100).toFixed(1) : 0}%
新規アポ獲得: ${weekData.newApptGained}, 再アポ獲得: ${weekData.reApptGained}
新規アポ消化: ${weekData.newApptDone}, 再アポ消化: ${weekData.reApptDone}
オーダー: ${weekData.newOrderPeople + weekData.residentOrderPeople + weekData.repeatPeople + weekData.replaceOrderPeople}名

■ 月累計（${weekIndex + 1}週目まで）
架電: ${totals.callCount}件, アポ獲得: ${totals.newApptGained}件, アポ消化: ${totals.newApptDone + totals.reApptDone}件, オーダー: ${totals.orders}名
月目標: 架電${allData.goals.callCount}件, アポ獲得${allData.goals.newApptGained}件, オーダー${allData.goals.orderPeople}名

■ 本人の目標: ${issue.goal || "未記入"}
■ 本人の結果認識: ${issue.result || "未記入"}
■ 本人の課題認識: ${issue.issue || "未記入"}

改善案を簡潔に3つ、それぞれ2-3行で提案してください。数字に基づいた具体的なアドバイスをお願いします。`;

      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const { suggestion } = await res.json();
        const next = [...issues];
        next[weekIndex] = { ...next[weekIndex], aiSuggestion: suggestion };
        onChange(next);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(null);
    }
  };

  const hCell = "border border-gray-400 px-2 py-2 text-xs font-bold text-center bg-yellow-100 whitespace-nowrap";
  const wCell = "border border-gray-400 px-2 py-2 text-xs font-bold bg-yellow-300 text-center whitespace-nowrap align-top";
  const tCell = "border border-gray-300 p-0 align-top";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-gray-400 rounded">
        <table className="border-collapse w-full text-xs">
          <thead>
            <tr>
              <th className={`${hCell} w-[60px]`}></th>
              <th className={`${hCell} w-1/4`}>目標</th>
              <th className={`${hCell} w-1/4`}>結果</th>
              <th className={`${hCell} w-1/4`}>課題</th>
              <th className={`${hCell} w-1/4`}>改善案</th>
            </tr>
          </thead>
          <tbody>
            {weekLabels.map((label, i) => (
              <tr key={i}>
                <td className={wCell}>
                  {label}
                  <button
                    onClick={() => handleAI(i)}
                    disabled={loading === i}
                    className="block mt-1 text-[9px] text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                    title="AIに改善案を聞く"
                  >
                    {loading === i ? "分析中" : "🤖AI"}
                  </button>
                </td>
                <td className={tCell}>
                  <textarea
                    value={issues[i]?.goal || ""}
                    onChange={(e) => updateIssue(i, "goal", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-blue-50 resize-y min-h-[80px]"
                    placeholder={"【営業】\n・○○企業に再アポ取得\n【テレアポ】\n・着電率向上"}
                  />
                </td>
                <td className={tCell}>
                  <textarea
                    value={issues[i]?.result || ""}
                    onChange={(e) => updateIssue(i, "result", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-blue-50 resize-y min-h-[80px]"
                    placeholder={"【営業】\n・逆アポ取得\n【テレアポ】\n・着電率25%に改善"}
                  />
                </td>
                <td className={tCell}>
                  <textarea
                    value={issues[i]?.issue || ""}
                    onChange={(e) => updateIssue(i, "issue", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-blue-50 resize-y min-h-[80px]"
                    placeholder={"【営業】\n・提案書のタイミング\n【テレアポ】\n・数字計測不足"}
                  />
                </td>
                <td className={tCell}>
                  <textarea
                    value={issues[i]?.improvement || ""}
                    onChange={(e) => updateIssue(i, "improvement", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-blue-50 resize-y min-h-[80px]"
                    placeholder={"【営業】\n・商談後すぐに提案書作成\n【テレアポ】\n・集計シートで毎日確認"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI suggestions display */}
      {issues.some((iss) => iss.aiSuggestion) && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-indigo-700">🤖 AI改善提案</h4>
          {issues.map((iss, i) =>
            iss.aiSuggestion ? (
              <div key={i} className="bg-indigo-50 border border-indigo-200 rounded p-3 text-xs">
                <span className="font-bold text-indigo-700">{weekLabels[i]}:</span>
                <div className="whitespace-pre-wrap mt-1 text-gray-800">{iss.aiSuggestion}</div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
