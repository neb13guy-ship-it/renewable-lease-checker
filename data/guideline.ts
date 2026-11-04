// Design Ref: §2.3, §12.1 — 실습용 업무지침 5개 조항을 코드에서 읽을 수 있는 데이터로 둔다.
// Plan 작업 2번: 지침 조항 데이터. 원문은 docs/guideline.md 이며, 문장은 바꿔 쓰지 않는다.
// 실제 내부 지침 원문이 아니라 작성자가 기억나는 내용을 정리한 실습용 지침이다.

import type { Citation } from "@/types/judge";

/** 지침 조항 한 개: 근거로 인용할 수 있는 형태(Citation)에 제목을 더한 것 */
export interface GuidelineArticle extends Citation {
  /** 조항 제목 (예: 현황, 주택) */
  title: string;
}

/** 실습용 업무지침 제1조~제5조 */
export const GUIDELINE_ARTICLES: readonly GuidelineArticle[] = [
  {
    article: 1,
    title: "현황",
    text: "농지, 임야 등으로 보존 필요가 높은 재산은 대부를 제한한다.",
  },
  {
    article: 2,
    title: "주택",
    text: "주변 200미터 반경에 주택이 있으면 대부를 제한한다.",
  },
  {
    article: 3,
    title: "토지이용계획",
    text: "토지이용계획상 자연환경보호 등 보존이 필요한 지역은 대부를 제한한다.",
  },
  {
    article: 4,
    title: "인접지 소유자",
    text: "인접지 소유자가 피대부자가 아닌 제3자로서 국유지를 매수할 수 있는 경우, 민원 방지를 위해 대부를 제한한다.",
  },
  {
    article: 5,
    title: "사전 확인",
    text: "지자체의 발전시설 허가 등이 가능한지 사전에 확인한다.",
  },
];

/** 조항 번호로 조항을 찾는다. 없는 번호(예: 제9조)면 undefined를 돌려준다. */
export function findArticle(article: number): GuidelineArticle | undefined {
  return GUIDELINE_ARTICLES.find((item) => item.article === article);
}
