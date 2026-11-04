// Design Ref: §2.2 ⑤, §7 — 서버에서만 AI를 호출해 지침 대조 결과를 받아온다.
// Plan 작업 8번: API 키를 .env에서 읽어 AI를 호출하는 부분. (응답 점검은 작업 9번에서 이어서 붙인다.)
// 주의: 이 파일은 서버 코드(app/api)에서만 불러온다. 화면(components)에서 불러오면 안 된다.
// API 키는 process.env에서만 읽고, 어디에도 출력하지 않는다.

import OpenAI from "openai";
import { z } from "zod";
import { GUIDELINE_ARTICLES } from "@/data/guideline";
import type { SiteInput, Verdict } from "@/types/judge";

/** 사용할 AI 모델. 바꾸려면 .env에 OPENAI_MODEL을 넣으면 된다. (저렴한 모델로 시작) */
const DEFAULT_MODEL = "gpt-4o-mini";

/** AI가 돌려줘야 하는 답의 모양. 이 모양이 아니면 오류로 본다. */
const answerSchema = z.object({
  verdict: z.enum(["가능", "불가", "추가 확인 필요"]),
  articles: z.array(z.number().int()),
  reasonSummary: z.string(),
});

export interface AiAnswer {
  verdict: Verdict;
  /** AI가 근거로 든 지침 조항 번호 (실제로 있는 조항인지는 작업 9번의 점검에서 확인한다) */
  articles: number[];
  reasonSummary: string;
}

const SYSTEM_PROMPT = `당신은 국유재산 대부 업무를 돕는 보조 도구입니다.
아래 [업무지침]에 있는 내용만 근거로 신재생에너지 발전시설의 국유지 대부 가능 여부를 판단합니다.
규칙:
- 지침에 없는 내용은 추측하지 않습니다. 지침만으로 판단하기 어려우면 "추가 확인 필요"로 답합니다.
- 판정은 "가능", "불가", "추가 확인 필요" 중 하나입니다.
- 지침이 "제한한다"고만 한 경우는 "불가"로 확정하지 말고 "추가 확인 필요"로 답합니다.
- 근거로 삼은 지침 조항 번호(숫자)를 articles에 담습니다. 존재하지 않는 조항 번호를 만들지 않습니다.
- reasonSummary는 담당자가 이해하기 쉬운 한두 문장의 한국어로 씁니다.
- 반드시 {"verdict": "...", "articles": [숫자, ...], "reasonSummary": "..."} 형태의 JSON만 답합니다.

[업무지침]
${GUIDELINE_ARTICLES.map((item) => `제${item.article}조(${item.title}) ${item.text}`).join("\n")}`;

const yesNo = (value: boolean | null, yes: string, no: string) => (value === null ? "미입력" : value ? yes : no);

/** 판정에 쓰는 6개 항목만 글로 풀어 쓴다. 참고 메모는 판정에 쓰지 않으므로 AI에 보내지 않는다. */
function describeInput(input: SiteInput): string {
  const owner = input.neighborOwner === null ? "미입력" : input.neighborOwner === "same" ? "신청자와 같음" : "신청자와 다름";
  return [
    `지목: ${input.landCategory || "미입력"}`,
    `부지 현황: ${input.siteStatus || "미입력"}`,
    `반경 200m 이내 주택: ${yesNo(input.housingWithin200m, "있음", "없음")}`,
    `인접지 소유자: ${owner}`,
    `토지이용계획상 보존이 필요한 지역: ${yesNo(input.isProtectedZone, "예", "아니오")}`,
    `지자체 발전시설 허가 사전 확인 결과 가능 여부: ${yesNo(input.localPermitPossible, "예", "아니오")}`,
  ].join("\n");
}

/**
 * 부지 정보를 업무지침과 대조해 판정과 근거 조항 번호를 받아온다.
 * 키가 없거나, 호출이 실패하거나, 답이 약속한 모양이 아니면 오류를 던진다.
 * (이때 "가능"을 지어내서 돌려주지 않는다. 오류 처리는 호출하는 쪽이 한다.)
 */
export async function askAi(input: SiteInput): Promise<AiAnswer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");

  const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `[부지 정보]\n${describeInput(input)}\n\n위 부지 정보를 업무지침과 대조해 JSON으로 답하세요.` },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI가 빈 답을 돌려주었습니다.");

  // 약속한 모양이 아니면 오류. JSON이 아니어도 여기서 오류가 난다.
  return answerSchema.parse(JSON.parse(content));
}
