// Design Ref: §2.2 ⑥, §8.3 — AI 응답 점검. AI의 답을 그대로 믿지 않고, 규칙에 어긋나면 "추가 확인 필요"로 바꾼다.
// Plan 작업 9번: 근거 조항이 없거나 규칙에 어긋나면 "추가 확인 필요"로 바꾸는 점검.
// 이 파일은 AI 호출 코드를 모른다. 그래서 AI 없이도 점검 규칙만 따로 시험할 수 있다.

import { findArticle } from "@/data/guideline";
import type { AiAnswer } from "@/lib/ai";
import type { Restriction } from "@/lib/rules";
import type { Citation, JudgeResult } from "@/types/judge";

/** 조항 번호 목록을 근거 조항(번호+원문)으로 바꾼다. 원문은 AI의 글이 아니라 지침 데이터에서 가져온다. */
function toCitations(articles: number[]): Citation[] {
  return [...new Set(articles)]
    .sort((a, b) => a - b)
    .flatMap((article) => {
      const found = findArticle(article);
      return found ? [{ article: found.article, text: found.text }] : [];
    });
}

/** 두 근거 목록을 조항 번호 기준으로 합친다. */
function mergeCitations(...lists: Citation[][]): Citation[] {
  return toCitations(lists.flat().map((item) => item.article));
}

/**
 * AI 응답을 점검해 최종 판별 결과를 만든다. (코드가 이미 확인한 제한 사유를 함께 받는다.)
 * - 지침에 없는 조항 번호를 들었거나 근거 조항이 하나도 없으면 → "추가 확인 필요"
 * - AI가 "불가"라고 했지만 불가로 확정하는 코드 규칙(주택·인접지 소유자)에 걸리지 않았으면 → "추가 확인 필요"
 * - AI가 "가능"이라고 했지만 코드가 찾은 제한 사유가 있으면 → "추가 확인 필요"
 * - 그 밖에는 AI의 판정을 따른다. 근거 조항의 원문은 항상 지침 데이터의 문장을 쓴다.
 */
export function verifyAiAnswer(answer: AiAnswer, restrictions: Restriction[], memo: string): JudgeResult {
  const restrictionCitations = restrictions.map((item) => item.citation);
  const restrictionReasons = restrictions.map((item) => item.reason).join(" ");
  const aiCitations = toCitations(answer.articles);
  const hasUnknownArticle = answer.articles.some((article) => !findArticle(article));

  // 아래는 모두 "판정을 보류"하는 경우다. 제한 사유는 함께 보여 준다.
  const hold = (why: string): JudgeResult => ({
    verdict: "추가 확인 필요",
    citations: mergeCitations(aiCitations, restrictionCitations),
    restrictions: restrictionCitations,
    reasonSummary: [restrictionReasons, why].filter(Boolean).join(" "),
    memo,
  });

  // Plan SC: 근거 조항 제시율 100% — 근거가 없거나 지침에 없는 조항이면 판정하지 않는다.
  if (hasUnknownArticle || aiCitations.length === 0) {
    return hold("AI의 답에서 지침의 근거 조항을 확인하지 못해 판정을 보류합니다.");
  }

  // "불가"는 코드 규칙으로만 확정한다. (여기까지 온 건은 불가 규칙에 걸리지 않은 건이다.)
  if (answer.verdict === "불가") {
    return hold("지침상 '불가'로 확정할 규칙에 해당하지 않아 판정을 보류합니다.");
  }

  // 코드가 찾은 제한 사유가 있으면 "가능"으로 둘 수 없다.
  if (answer.verdict === "가능" && restrictions.length > 0) {
    return hold("제한 사유가 있어 '가능'으로 판정할 수 없습니다.");
  }

  if (answer.verdict === "가능") {
    return {
      verdict: "가능",
      citations: aiCitations,
      restrictions: [],
      reasonSummary: answer.reasonSummary,
      memo,
    };
  }

  // AI도 "추가 확인 필요"라고 한 경우
  return {
    verdict: "추가 확인 필요",
    citations: mergeCitations(aiCitations, restrictionCitations),
    restrictions: restrictionCitations,
    reasonSummary: [restrictionReasons, answer.reasonSummary].filter(Boolean).join(" "),
    memo,
  };
}
