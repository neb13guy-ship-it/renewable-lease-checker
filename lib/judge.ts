// Design Ref: §2.2 ②③④⑤⑥ — 판별 흐름 전체. 코드 규칙 → (필요할 때만) AI 호출 → AI 응답 점검.
// Plan 작업 7번: 규칙 실행. Plan 작업 9번: AI 호출과 응답 점검을 이어서 붙임.
// AI 호출 함수는 바깥에서 넣어 줄 수 있어서(기본값은 실제 AI), AI 없이도 판별 흐름을 시험할 수 있다.

import { findArticle } from "@/data/guideline";
import { askAi } from "@/lib/ai";
import type { AiAnswer } from "@/lib/ai";
import { findHardRejections, findMissingFields, findRestrictions, REQUIRED_FIELDS } from "@/lib/rules";
import type { Restriction, RequiredFieldKey } from "@/lib/rules";
import { verifyAiAnswer } from "@/lib/verify";
import type { Citation, JudgeResult, SiteInput } from "@/types/judge";

/** 비어 있는 항목이 어느 지침 조항의 판단에 필요한지 (부지 현황은 어느 조항에도 쓰이지 않는다) */
const ARTICLE_BY_FIELD: Partial<Record<RequiredFieldKey, number>> = {
  landCategory: 1,
  housingWithin200m: 2,
  isProtectedZone: 3,
  neighborOwner: 4,
  localPermitPossible: 5,
};

/** 조항 번호 목록을 근거 조항(번호+원문)으로 바꾼다. 중복은 한 번만 담는다. */
function citationsFor(articles: number[]): Citation[] {
  const unique = [...new Set(articles)].sort((a, b) => a - b);
  return unique.flatMap((article) => {
    const found = findArticle(article);
    return found ? [{ article: found.article, text: found.text }] : [];
  });
}

/** 코드 규칙 단계의 결과: 여기서 끝나거나(final), AI에게 넘길 건(pending)이다. */
type RulesOutcome = { final: JudgeResult } | { pending: Restriction[] };

/**
 * 코드로 확정하는 규칙들을 순서대로 실행한다: ② 불가 규칙 → ③ 누락 검사 → ④ 제한 사유
 * - 불가 규칙에 하나라도 해당하면 다른 항목이 비어 있어도 "불가"가 우선하고, AI에 보내지 않는다.
 * - 필수 항목이 비어 있으면 "추가 확인 필요"로 끝난다. (AI에 보내지 않는다.)
 * - 그 밖의 건은 제한 사유(있다면)와 함께 AI에게 넘긴다.
 */
export function evaluateRules(input: SiteInput): RulesOutcome {
  // Plan SC: FR-03·FR-04 — 불가 규칙이 먼저
  const rejections = findHardRejections(input);
  if (rejections.length > 0) {
    return {
      final: {
        verdict: "불가",
        citations: rejections.map((item) => item.citation),
        restrictions: findRestrictions(input).map((item) => item.citation),
        reasonSummary: rejections.map((item) => item.reason).join(" "),
        memo: input.memo,
      },
    };
  }

  // Plan SC: FR-02 — 필수 입력이 하나라도 비면 판별하지 않고 "추가 확인 필요"
  const missing = findMissingFields(input);
  if (missing.length > 0) {
    const names = REQUIRED_FIELDS.filter(({ key }) => missing.includes(key)).map(({ label }) => label);
    return {
      final: {
        verdict: "추가 확인 필요",
        citations: citationsFor(missing.flatMap((key) => ARTICLE_BY_FIELD[key] ?? [])),
        restrictions: [],
        reasonSummary: `입력하지 않은 항목이 있어 판별할 수 없습니다: ${names.join(", ")}`,
        memo: input.memo,
      },
    };
  }

  return { pending: findRestrictions(input) };
}

/**
 * 판별 전체 흐름. 코드 규칙에서 끝나지 않은 건만 AI에게 묻고, 그 답을 점검해서 결과를 만든다.
 * AI 호출이 실패하면 오류를 그대로 던진다. (판정을 지어내지 않는다. 오류 안내는 호출하는 쪽이 한다.)
 */
export async function judge(
  input: SiteInput,
  ask: (input: SiteInput) => Promise<AiAnswer> = askAi,
): Promise<JudgeResult> {
  const outcome = evaluateRules(input);
  if ("final" in outcome) return outcome.final;

  const answer = await ask(input);
  return verifyAiAnswer(answer, outcome.pending, input.memo);
}
