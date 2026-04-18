import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback: generate a mock suggestion for demo
    return NextResponse.json({
      suggestion: generateMockSuggestion(prompt),
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        suggestion: generateMockSuggestion(prompt),
      });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "提案を生成できませんでした。";
    return NextResponse.json({ suggestion: text });
  } catch {
    return NextResponse.json({
      suggestion: generateMockSuggestion(prompt),
    });
  }
}

function generateMockSuggestion(prompt: string): string {
  // Extract some numbers from prompt for context-aware mock
  const callMatch = prompt.match(/架電: (\d+)件/);
  const apptMatch = prompt.match(/アポ獲得: (\d+)件/);
  const orderMatch = prompt.match(/オーダー: (\d+)名/);
  const goalCallMatch = prompt.match(/架電(\d+)件/);

  const calls = callMatch ? parseInt(callMatch[1]) : 0;
  const appts = apptMatch ? parseInt(apptMatch[1]) : 0;
  const orders = orderMatch ? parseInt(orderMatch[1]) : 0;
  const goalCalls = goalCallMatch ? parseInt(goalCallMatch[1]) : 0;

  const suggestions: string[] = [];

  if (goalCalls > 0 && calls < goalCalls * 0.5) {
    suggestions.push(`【行動量の改善】\n架電数が月目標${goalCalls}件に対して${calls}件（${((calls/goalCalls)*100).toFixed(0)}%）と不足しています。残り${goalCalls - calls}件を残りの週で消化するには、1日あたり${Math.ceil((goalCalls - calls) / 10)}件のペースが必要です。AIテレアポの稼働時間を増やすか、架電に集中する時間帯を固定しましょう。`);
  }

  if (calls > 200 && appts < 5) {
    suggestions.push(`【テレアポの質の改善】\n架電${calls}件に対してアポ獲得${appts}件と、転換率が低い状態です。1通話あたりの時間を確認し、短すぎる場合はトークスクリプトを見直しましょう。着電後に担当者名を確認し、次回架電に活かすフローを作ることで効率が上がります。`);
  }

  if (appts > 5 && orders === 0) {
    suggestions.push(`【商談力の強化】\nアポは${appts}件獲得できていますがオーダーに繋がっていません。商談の質を改善するため、①提案書を事前に準備する ②ベテランの商談に同行する ③見込み企業への後追いタイミングを早める（商談翌日にフォロー）を試みてください。`);
  }

  if (orders > 3) {
    suggestions.push(`【成果の維持と新規開拓のバランス】\nオーダー${orders}名と好調です。ただし既存顧客への依存度が高くないか確認してください。週に最低1件は新規アポを入れ、半年後のパイプライン枯渇を防ぎましょう。`);
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "【基本行動の徹底】\nまず架電数を安定させることが最優先です。毎日の架電目標を決め、午前中に集中して架電する時間を確保しましょう。",
      "【アポの質の向上】\n取得したアポは必ず消化し、商談前に企業情報を調べて具体的な提案ができるよう準備しましょう。",
      "【振り返りの習慣化】\n毎週金曜に数字を振り返り、翌週の具体的なアクションを3つ決めましょう。数字の変化を自分で把握することが成長の第一歩です。"
    );
  }

  while (suggestions.length < 3) {
    suggestions.push("【コミュニケーション強化】\n上司や先輩に週1回は商談のフィードバックをもらいましょう。自分では気づけない改善点が見つかります。");
  }

  return suggestions.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join("\n\n");
}
