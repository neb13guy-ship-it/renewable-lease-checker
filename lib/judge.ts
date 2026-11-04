// Design Ref: §2.2 ②③④ — 코드로 확정하는 규칙들을 순서대로 실행해 판별 결과를 만든다.
// Plan 작업 7번: 3~5번 규칙을 실행하는 부분. AI 호출(⑤)과 응답 점검(⑥)은 작업 8·9번에서 이어서 붙인다.
// 이 파일은 AI 호출 코드를 모른다. 그래서 AI 없이도 판별 흐름을 시험할 수 있다.

import { findArticle } from "@/data/guideline";
import { findHardRejections, findMissingFields, findRestrictions, REQUIRED_FIELDS } from "@/lib/rules";
import type { RequiredFieldKey } from "@/lib/rules";
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

/** 규칙 단계에서 끝나지 않은 건에 대해 돌려주는 임시 안내. AI 판별(작업 8번)이 붙으면 대체된다. */
const AI_NOT_CONNECTED = "지침 대조(AI) 기능이 아직 연결되지 않아 최종 판정은 보류합니다.";

/**
 * 판별 흐름: ② 불가 규칙 → ③ 누락 검사 → ④ 제한 사유 → (⑤⑥ AI는 이후 작업)
 * - 불가 규칙에 하나라도 해당하면 다른 항목이 비어 있어도 "불가"가 우선한다.
 * - 필수 항목이 비어 있으면 "추가 확인 필요"로 끝난다.
 * - 그 밖에는 제한 사유가 있으면 함께 보여 주고, 최소 "추가 확인 필요"가 된다.
 */
export function judgeByRules(input: SiteInput): JudgeResult {
  // Plan SC: FR-03·FR-04 — 불가 규칙이 먼저, 해당하면 AI에 보내지 않는다.
  const rejections = findHardRejections(input);
  if (rejections.length > 0) {
    return {
      verdict: "불가",
      citations: rejections.map((item) => item.citation),
      restrictions: findRestrictions(input).map((item) => item.citation),
      reasonSummary: rejections.map((item) => item.reason).join(" "),
      memo: input.memo,
    };
  }

  // Plan SC: FR-02 — 필수 입력이 하나라도 비면 판별하지 않고 "추가 확인 필요"
  const missing = findMissingFields(input);
  if (missing.length > 0) {
    const names = REQUIRED_FIELDS.filter(({ key }) => missing.includes(key)).map(({ label }) => label);
    return {
      verdict: "추가 확인 필요",
      citations: citationsFor(missing.flatMap((key) => ARTICLE_BY_FIELD[key] ?? [])),
      restrictions: [],
      reasonSummary: `입력하지 않은 항목이 있어 판별할 수 없습니다: ${names.join(", ")}`,
      memo: input.memo,
    };
  }

  // Plan SC: FR-05 — 제한 사유가 있으면 "불가"로 확정하지 않고 "추가 확인 필요"
  const restrictions = findRestrictions(input);
  if (restrictions.length > 0) {
    return {
      verdict: "추가 확인 필요",
      citations: restrictions.map((item) => item.citation),
      restrictions: restrictions.map((item) => item.citation),
      reasonSummary: `${restrictions.map((item) => item.reason).join(" ")} ${AI_NOT_CONNECTED}`,
      memo: input.memo,
    };
  }

  // 불가·누락·제한 사유가 모두 없는 건: 지침 대조는 AI의 몫이므로 지금은 판정을 보류한다.
  return {
    verdict: "추가 확인 필요",
    citations: citationsFor([1, 2, 3, 4, 5]),
    restrictions: [],
    reasonSummary: `불가 규칙과 제한 사유에는 해당하지 않습니다. ${AI_NOT_CONNECTED}`,
    memo: input.memo,
  };
}
