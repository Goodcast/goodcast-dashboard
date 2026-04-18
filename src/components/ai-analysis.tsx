"use client";

import { useState } from "react";
import type { MemberMonthData } from "@/lib/types";

interface Props {
  memberName: string;
  data: MemberMonthData;
}

interface Message {
  role: "ai" | "user";
  text: string;
}

export function AIAnalysis({ memberName, data }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const totals = data.weeks.reduce(
    (acc, w) => ({
      callCount: acc.callCount + w.callCount,
      contactCount: acc.contactCount + w.contactCount,
      newApptGained: acc.newApptGained + w.newApptGained,
      reApptGained: acc.reApptGained + w.reApptGained,
      newApptDone: acc.newApptDone + w.newApptDone,
      reApptDone: acc.reApptDone + w.reApptDone,
      orders: acc.orders + w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople,
      newProspectCompanies: acc.newProspectCompanies + w.newProspectCompanies,
      callDuration: acc.callDuration + w.callDuration,
      newCompanies: acc.newCompanies + w.newCompanies,
    }),
    { callCount: 0, contactCount: 0, newApptGained: 0, reApptGained: 0, newApptDone: 0, reApptDone: 0, orders: 0, newProspectCompanies: 0, callDuration: 0, newCompanies: 0 }
  );

  const contactRate = totals.callCount > 0 ? (totals.contactCount / totals.callCount * 100) : 0;
  const apptRate = totals.contactCount > 0 ? (totals.newApptGained / totals.contactCount * 100) : 0;
  const apptDoneTotal = totals.newApptDone + totals.reApptDone;
  const orderRate = apptDoneTotal > 0 ? (totals.orders / apptDoneTotal * 100) : 0;
  const avgCallTime = totals.callCount > 0 ? totals.callDuration / totals.callCount : 0;
  const apptConsumeRate = (totals.newApptGained + totals.reApptGained) > 0
    ? (apptDoneTotal / (totals.newApptGained + totals.reApptGained) * 100) : 0;

  // Build context for AI
  const numberContext = `
■ ${memberName}の今月実績
架電数: ${totals.callCount}件（目標: ${data.goals.callCount}件、達成率: ${data.goals.callCount > 0 ? ((totals.callCount / data.goals.callCount) * 100).toFixed(1) : "—"}%）
着電数: ${totals.contactCount}件、着電率: ${contactRate.toFixed(1)}%
1通話あたり平均時間: ${avgCallTime.toFixed(1)}秒
新規アポ獲得: ${totals.newApptGained}件（目標: ${data.goals.newApptGained}件）
再アポ獲得: ${totals.reApptGained}件（目標: ${data.goals.reApptGained}件）
新規アポ消化: ${totals.newApptDone}件 / 再アポ消化: ${totals.reApptDone}件
アポ消化率: ${apptConsumeRate.toFixed(1)}%
着電→アポ率: ${apptRate.toFixed(1)}%
アポ→オーダー率: ${orderRate.toFixed(1)}%
オーダー: ${totals.orders}名（目標: ${data.goals.orderPeople}名）
新規企業数: ${totals.newCompanies}
新規見込み企業: ${totals.newProspectCompanies}社
担当企業数: ${data.monthly.managedCompanies}社、稼働人数: ${data.monthly.activeWorkers}名
今月入社: ${data.monthly.newHires}名、退職: ${data.monthly.confirmedResignations}名

■ 週次推移
${data.weeks.map((w, i) => {
  const wOrders = w.newOrderPeople + w.residentOrderPeople + w.repeatPeople + w.replaceOrderPeople;
  return `${i + 1}週目: 架電${w.callCount}件 着電${w.contactCount}件 アポ獲得${w.newApptGained} アポ消化${w.newApptDone + w.reApptDone} オーダー${wOrders}`;
}).join("\n")}`;

  // Identify problems from numbers
  function findProblems(): string[] {
    const problems: string[] = [];

    if (data.goals.callCount > 0 && totals.callCount < data.goals.callCount * 0.5) {
      problems.push(`架電数が目標${data.goals.callCount}件に対して${totals.callCount}件（${((totals.callCount / data.goals.callCount) * 100).toFixed(0)}%）で大きく不足しています。`);
    }

    if (contactRate < 15 && totals.callCount > 100) {
      problems.push(`着電率が${contactRate.toFixed(1)}%と低いです。架電のタイミングや対象リストの質に問題がある可能性があります。`);
    }

    if (apptRate < 5 && totals.contactCount > 30) {
      problems.push(`着電→アポ率が${apptRate.toFixed(1)}%と低いです。着電してもアポに繋がっていません。トークの質が課題の可能性があります。`);
    }

    if (totals.newApptGained > 5 && apptConsumeRate < 60) {
      problems.push(`アポ獲得${totals.newApptGained + totals.reApptGained}件に対して消化${apptDoneTotal}件（消化率${apptConsumeRate.toFixed(0)}%）。アポを取っても消化しきれていません。`);
    }

    if (apptDoneTotal > 5 && totals.orders === 0) {
      problems.push(`アポ消化${apptDoneTotal}件でオーダー0。商談の質・提案内容・クロージングに課題がある可能性があります。`);
    }

    if (totals.orders > 0 && totals.newCompanies === 0 && totals.callCount < 100) {
      problems.push(`オーダーは出ていますが新規開拓（架電${totals.callCount}件）がほぼ止まっています。半年後のパイプライン枯渇リスクがあります。`);
    }

    if (avgCallTime > 0 && avgCallTime < 60 && totals.callCount > 100) {
      problems.push(`1通話あたり${avgCallTime.toFixed(0)}秒と短いです。担当者に繋がる前に切れている、またはトークが浅い可能性があります。`);
    }

    if (data.monthly.confirmedResignations > 0 && data.monthly.newHires === 0) {
      problems.push(`退職${data.monthly.confirmedResignations}名に対して入社${data.monthly.newHires}名。稼働人数が純減しています。`);
    }

    return problems;
  }

  const startAnalysis = async () => {
    const problems = findProblems();
    if (problems.length === 0 && totals.callCount === 0) {
      setMessages([{
        role: "ai",
        text: "まだ数字が入力されていません。週次データを入力してから分析を開始してください。",
      }]);
      return;
    }

    let initialMessage = `## ${memberName}さんの数字を分析しました\n\n`;

    if (problems.length > 0) {
      initialMessage += `### 改善が必要な数字\n\n`;
      problems.forEach((p, i) => {
        initialMessage += `**${i + 1}.** ${p}\n\n`;
      });
      initialMessage += `---\n\n`;
      initialMessage += `上記の中で、一番気になっている課題はどれですか？\nまた、**なぜその数字が出ていないか**、自分で思い当たることがあれば教えてください。\n\n`;
      initialMessage += `例：「架電数が少ないのは面接対応に時間を取られているから」\n例：「アポは取れるが商談で何を話せばいいかわからない」`;
    } else {
      initialMessage += `現時点の数字は概ね良好です。\n\n`;
      initialMessage += `- 架電: ${totals.callCount}件\n- アポ獲得: ${totals.newApptGained}件\n- オーダー: ${totals.orders}名\n\n`;
      initialMessage += `さらに伸ばしたい数字や、困っていることがあれば教えてください。`;
    }

    setMessages([{ role: "ai", text: initialMessage }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = newMessages.map((m) =>
        m.role === "ai" ? `アドバイザー: ${m.text}` : `${memberName}: ${m.text}`
      ).join("\n\n");

      const prompt = `あなたはベトナム人エンジニア派遣会社の営業アドバイザーです。
以下の営業担当者の数字データと、これまでの会話をもとに返答してください。

【重要なルール】
1. 必ず具体的な数字を引用して話す
2. 「なぜその数字になっているか」を本人に質問して原因を探る
3. 原因がわかったら、具体的で実行可能な改善案を提案する
4. 一度に質問は1-2個に絞る（質問攻めにしない）
5. 相手の回答を踏まえて深掘りする
6. 改善案は「来週から」できる具体的なアクションにする

${numberContext}

■ これまでの会話
${conversationHistory}

上記を踏まえて、次の返答をしてください。簡潔に、300文字以内で。`;

      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const { suggestion } = await res.json();
        setMessages([...newMessages, { role: "ai", text: suggestion }]);
      } else {
        setMessages([...newMessages, { role: "ai", text: "⚠️ 応答の取得に失敗しました。" }]);
      }
    } catch {
      setMessages([...newMessages, { role: "ai", text: "⚠️ 接続エラーです。" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Start button */}
      {messages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            入力された数字をもとに、どの数字を改善すべきか分析し、<br/>
            なぜその数字が出ていないかを一緒に探ります。
          </p>
          <button
            onClick={startAnalysis}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            🤖 数字を分析して改善ポイントを見つける
          </button>
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}>
                {msg.role === "ai" && <span className="text-xs text-indigo-600 font-medium block mb-1">🤖 AI分析</span>}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500 border border-gray-200">
                分析中...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {messages.length > 0 && (
        <div className="flex gap-2 border-t border-gray-200 pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="課題や状況を入力してください..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            送信
          </button>
          <button
            onClick={() => setMessages([])}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            リセット
          </button>
        </div>
      )}
    </div>
  );
}
