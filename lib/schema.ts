// Design Ref: §2.2 ① — 서버로 들어온 입력을 검사한다.
// 빈칸(미입력)은 허용한다. 빈칸은 오류가 아니라 판정("불가" 또는 "추가 확인 필요")으로 이어지기 때문이다.
// 오류(400)로 거르는 것은 "목록에 없는 값"과 형식이 틀린 값뿐이다.

import { z } from "zod";
import { LAND_CATEGORIES, SITE_STATUSES } from "@/data/siteOptions";
import type { SiteInput } from "@/types/judge";

/** 비어 있음("")이거나 선택지 중 하나만 허용 */
const optionOrEmpty = (options: readonly [string, ...string[]]) => z.enum(["", ...options]);

/** 예/아니오 선택: true, false, 미입력(null 또는 생략) */
const yesNo = z.boolean().nullable().default(null);

const siteInputSchema = z.object({
  landCategory: optionOrEmpty(LAND_CATEGORIES).default(""),
  siteStatus: optionOrEmpty(SITE_STATUSES).default(""),
  housingWithin200m: yesNo,
  neighborOwner: z.enum(["same", "different"]).nullable().default(null),
  isProtectedZone: yesNo,
  localPermitPossible: yesNo,
  memo: z.string().max(1000).default(""),
});

/** 입력이 올바른 모양이면 SiteInput을, 아니면 null을 돌려준다. */
export function parseSiteInput(raw: unknown): SiteInput | null {
  const parsed = siteInputSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
