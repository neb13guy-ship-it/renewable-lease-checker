// Design Ref: §2.2 ②③ — 코드로 확정하는 규칙들(불가 규칙, 필수 입력 누락 검사).
// Plan 작업 3번: 필수 입력 6개 누락 검사. Plan 작업 4번: "불가" 규칙 판정.
// Plan 작업 5번: 제한 사유 규칙 (보존 현황·보존 지역·지자체 허가 "아니오").
// 이 파일은 AI 호출 코드를 모른다. 그래서 AI 없이도 규칙만 따로 시험할 수 있다.

import { findArticle } from "@/data/guideline";
import type { Citation, SiteInput } from "@/types/judge";

/** 판정에 쓰는 필수 입력 6개의 이름. 참고 메모(memo)는 판정에 쓰지 않으므로 포함하지 않는다. */
export type RequiredFieldKey =
  | "landCategory"
  | "siteStatus"
  | "housingWithin200m"
  | "neighborOwner"
  | "isProtectedZone"
  | "localPermitPossible";

/** 필수 입력 6개와 화면에 보여 줄 한국어 이름 (PRD §5 순서) */
export const REQUIRED_FIELDS: readonly { key: RequiredFieldKey; label: string }[] = [
  { key: "landCategory", label: "지목" },
  { key: "siteStatus", label: "부지 현황" },
  { key: "housingWithin200m", label: "반경 200m 이내 주택 존재 여부" },
  { key: "neighborOwner", label: "인접지 소유자" },
  { key: "isProtectedZone", label: "보존 지역 여부" },
  { key: "localPermitPossible", label: "지자체 허가 가능 여부" },
];

/** 값이 비어 있는지 판단한다. 글자는 공백만 있어도 빈 것으로 본다. null·undefined도 빈 것이다. */
function isEmpty(value: unknown): boolean {
  if (typeof value === "string") return value.trim() === "";
  return value === null || value === undefined;
}

/**
 * 비어 있는 필수 항목을 PRD §5 순서대로 돌려준다. 모두 채워져 있으면 빈 목록이다.
 * 주의: "아니오(false)"는 빈 값이 아니라 선택한 값이다.
 */
export function findMissingFields(input: SiteInput): RequiredFieldKey[] {
  // Plan SC: 필수 입력 하나라도 비면 판별하지 않고 "추가 확인 필요" (FR-02)
  return REQUIRED_FIELDS.filter(({ key }) => isEmpty(input[key])).map(({ key }) => key);
}

/** 코드가 "불가"로 확정한 사유 한 개 */
export interface HardRejection {
  /** 근거가 된 지침 조항 (번호와 원문 문장 그대로) */
  citation: Citation;
  /** 담당자에게 보여 줄 쉬운 설명 */
  reason: string;
}

/** 지침에서 조항을 찾는다. 데이터에 없으면 실수이므로 바로 알 수 있게 오류를 낸다. */
function requireArticle(article: number): Citation {
  const found = findArticle(article);
  if (!found) throw new Error(`지침에 제${article}조가 없습니다.`);
  return { article: found.article, text: found.text };
}

/**
 * "불가"로 확정되는 사유를 모두 돌려준다. 하나도 없으면 빈 목록이다.
 * 하나라도 있으면 다른 항목이 비어 있어도 "불가"가 우선하고, 이 건은 AI에 보내지 않는다.
 * 값이 비어 있거나(null) "아니오"인 항목은 불가 사유가 아니다. (빈칸은 findMissingFields가 다룬다.)
 */
export function findHardRejections(input: SiteInput): HardRejection[] {
  const rejections: HardRejection[] = [];

  // Plan SC: FR-03 — 반경 200m 이내에 주택이 있으면 대부 허용 "불가" (지침 제2조)
  if (input.housingWithin200m === true) {
    rejections.push({
      citation: requireArticle(2),
      reason: "반경 200m 이내에 주택이 있어 대부를 허용할 수 없습니다.",
    });
  }

  // Plan SC: FR-04 — 인접지 소유자가 신청자와 다르면 장기 대부 "불가" (지침 제4조)
  // 인접지가 여러 필지이면 한 필지라도 다를 때 "다름"으로 입력하는 것이 전제다. (PRD §6)
  if (input.neighborOwner === "different") {
    rejections.push({
      citation: requireArticle(4),
      reason: "인접지 소유자가 신청자와 달라 장기 대부를 허용할 수 없습니다. (인접지 소유자에게 수의매각할 가능성)",
    });
  }

  return rejections;
}

/** 제한 사유 한 개. "불가"로 확정하지 않고 "추가 확인 필요"와 함께 보여 줄 사유이다. */
export type Restriction = HardRejection;

/**
 * 보존 필요가 높다고 보는 부지 현황. (DESIGN §3.2 제안 목록 기준이며, 선택 목록이 확정되면 함께 고친다.)
 * 지침 제1조의 "농지, 임야 등"에서 "등"에 무엇이 들어가는지는 아직 정해지지 않았다.
 */
export const PROTECTED_SITE_STATUSES: readonly string[] = ["농지", "임야"];

/**
 * 제한 사유를 모두 돌려준다. 하나도 없으면 빈 목록이다.
 * 제한 사유가 있어도 "불가"로 확정하지 않고, 결과는 최소 "추가 확인 필요"가 된다.
 * 값이 비어 있는 항목은 제한 사유가 아니다. (빈칸은 findMissingFields가 다룬다.)
 */
export function findRestrictions(input: SiteInput): Restriction[] {
  const restrictions: Restriction[] = [];

  // Plan SC: FR-05 — 농지·임야 등 보존 필요가 높은 현황은 제한 (지침 제1조)
  if (PROTECTED_SITE_STATUSES.includes(input.siteStatus)) {
    restrictions.push({
      citation: requireArticle(1),
      reason: `부지 현황이 '${input.siteStatus}'로 보존 필요가 높아 대부가 제한될 수 있습니다.`,
    });
  }

  // Plan SC: FR-05 — 토지이용계획상 보존이 필요한 지역은 제한 (지침 제3조)
  if (input.isProtectedZone === true) {
    restrictions.push({
      citation: requireArticle(3),
      reason: "토지이용계획상 보존이 필요한 지역이라 대부가 제한될 수 있습니다.",
    });
  }

  // Plan SC: 결정 사항 — 지자체 허가 가능 여부가 "아니오"이면 불가가 아니라 "추가 확인 필요" (지침 제5조)
  if (input.localPermitPossible === false) {
    restrictions.push({
      citation: requireArticle(5),
      reason: "지자체의 발전시설 허가 등이 가능한지 사전 확인 결과가 '아니오'라 추가 확인이 필요합니다.",
    });
  }

  return restrictions;
}
