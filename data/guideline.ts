// Design Ref: §2.3, §12.1 — 실습용 업무지침의 기본검토사항 4개를 코드에서 읽을 수 있는 데이터로 둔다.
// Plan 작업 2번: 지침 조항 데이터. 원문은 docs/guideline.md 이며, 문장은 바꿔 쓰지 않는다.
// 실제 내부 지침 원문이 아니라 작성자가 기억나는 내용을 정리한 실습용 지침이다.

import type { Citation } from "@/types/judge";

/** 기본검토사항 한 개: 근거로 인용할 수 있는 형태(Citation)에 제목을 더한 것 */
export interface GuidelineArticle extends Citation {
  /** 기본검토사항 제목 (예: 활용성정도, 민원발생 가능성) */
  title: string;
}

/** 실습용 업무지침 기본검토사항 1~4 (코드 안에서는 article 번호로 부른다) */
export const GUIDELINE_ARTICLES: readonly GuidelineArticle[] = [
  {
    article: 1,
    title: "활용성정도",
    text: "현재 일반적인 용도로의 활용성이 현저히 낮고, 장기적으로도 현저히 낮은 재산(활용성이 낮지만 현황 농지, 임야 등 현상유지 필요성이 높은 재산의 경우는 대부 제한)",
  },
  {
    article: 2,
    title: "민원발생 가능성",
    text: "국토계획법상 주거지역이 아니고, 지역불문하고 인접지에 주택이 없을것, 기타 주변 민원(경관훼손, 전자파 노출, 반사광, 열섬현장, 주변 동식물 영향등) 가능성 고려",
  },
  {
    article: 3,
    title: "이해관계자 확인",
    text: "대상 국유지에 국유재산법상 수의매각 가능한 자가 있는지 확인(ex 인접토지 소유자)",
  },
  {
    article: 4,
    title: "지자체 사전확인",
    text: "시설물 입지제한 관련 지침 및 조례 확인, 대부목적 사업추진을 위한 지자체 행정절차 추진사항 검토",
  },
];

/** 조항 번호로 조항을 찾는다. 없는 번호(예: 9)면 undefined를 돌려준다. */
export function findArticle(article: number): GuidelineArticle | undefined {
  return GUIDELINE_ARTICLES.find((item) => item.article === article);
}
