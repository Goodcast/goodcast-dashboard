"use client";

import { useState } from "react";
import type { WeeklyIssue, MemberMonthData } from "@/lib/types";

interface Props {
  weekIndex: number;
  issue: WeeklyIssue;
  onChange: (issue: WeeklyIssue) => void;
  memberName: string;
  allData: MemberMonthData;
}

export function IssueForm({ weekIndex, issue, onChange, memberName, allData }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAI = async () => {
    setLoading(true);
    try {
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
        onChange({ ...issue, aiSuggestion: suggestion });
      } else {
        onChange({ ...issue, aiSuggestion: "⚠️ AI提案の取得に失敗しました。API設定を確認してください。" });
      }
    } catch {
      onChange({ ...issue, aiSuggestion: "⚠️ 接続エラー。もう一度試してください。" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">目標（今週やること）</label>
          <textarea
            value={issue.goal}
            onChange={(e) => onChange({ ...issue, goal: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="【営業】&#10;・○○企業に再アポ取得&#10;【テレアポ】&#10;・着電率向上"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">結果</label>
          <textarea
            value={issue.result}
            onChange={(e) => onChange({ ...issue, result: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="【営業】&#10;・○○企業から逆アポ取得&#10;【テレアポ】&#10;・着電率25%に改善"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">課題</label>
          <textarea
            value={issue.issue}
            onChange={(e) => onChange({ ...issue, issue: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="【営業】&#10;・提案書送るタイミングが遅い&#10;【テレアポ】&#10;・数字計測ができていない"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">自分の改善案</label>
          <textarea
            value={issue.improvement}
            onChange={(e) => onChange({ ...issue, improvement: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="【営業】&#10;・商談後すぐに提案書作成&#10;【テレアポ】&#10;・集計シートで毎日確認"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-indigo-700 flex items-center gap-1">
            🤖 AI改善提案
          </h4>
          <button
            onClick={handleAI}
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "分析中..." : "AIに改善案を聞く"}
          </button>
        </div>
        {issue.aiSuggestion && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {issue.aiSuggestion}
          </div>
        )}
      </div>
    </div>
  );
}
