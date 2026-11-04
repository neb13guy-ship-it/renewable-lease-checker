// Design Ref: §2.2 ③ — 필수 입력 항목이 비어 있는지 확인하는 검사.
// Plan 작업 3번: 필수 입력 6개 누락 검사. (불가 규칙·제한 사유 규칙은 이후 작업에서 이 파일에 이어서 추가한다.)
// 이 파일은 AI 호출 코드를 모른다. 그래서 AI 없이도 규칙만 따로 시험할 수 있다.

import type { SiteInput } from "@/types/judge";

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
