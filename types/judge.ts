// Design Ref: §3.1 — 화면과 서버 사이에 오가는 데이터의 모양(입력·결과)을 정의한다.
// Plan 작업 1번: 입력 항목과 판별 결과의 형태(타입)를 정한다.
// 이 파일은 타입만 담고, 외부 라이브러리에 의존하지 않는다.

/** 입력: 필수 6개 + 참고 메모 1개. 아직 고르지 않은 항목은 null(또는 빈 문자열)로 둔다. */
export interface SiteInput {
  /** 지목 (선택 목록) */
  landCategory: string;
  /** 부지 현황 (선택 목록) */
  siteStatus: string;
  /** 반경 200m 이내 주택 존재 여부 (예=true / 아니오=false / 미입력=null) */
  housingWithin200m: boolean | null;
  /** 인접지 소유자: 대부 신청자와 같음 / 다름 (미입력=null) */
  neighborOwner: "same" | "different" | null;
  /** 토지이용계획상 자연환경보호 등 보존이 필요한 지역인지 (미입력=null) */
  isProtectedZone: boolean | null;
  /** 지자체의 발전시설 허가 등이 가능한지 사전 확인 결과 (미입력=null) */
  localPermitPossible: boolean | null;
  /** 참고 메모: 결과와 함께 보여 줄 뿐 판정에는 쓰지 않는다. */
  memo: string;
}

/** 판별 결과는 이 세 가지뿐이다. */
export type Verdict = "가능" | "불가" | "추가 확인 필요";

/** 근거가 된 지침 조항 한 개 (조항 번호와 원문 문장을 그대로 담는다). */
export interface Citation {
  /** 조항 번호 (제1조~제5조 → 1~5) */
  article: number;
  /** 지침 원문 문장 (바꿔 쓰지 않는다) */
  text: string;
}

/** 판별 결과 */
export interface JudgeResult {
  /** 판정: 가능 / 불가 / 추가 확인 필요 */
  verdict: Verdict;
  /** 근거 조항 (최소 1개) */
  citations: Citation[];
  /** 제한 사유 (없으면 빈 목록) */
  restrictions: Citation[];
  /** 한두 문장으로 쉽게 풀어 쓴 설명 */
  reasonSummary: string;
  /** 입력한 참고 메모를 그대로 되돌려 준다 (판정에는 쓰지 않음) */
  memo: string;
}
