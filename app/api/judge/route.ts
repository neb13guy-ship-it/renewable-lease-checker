// Design Ref: §4 — POST /api/judge: 부지 정보를 받아 판별 결과를 돌려준다.
// Plan 작업 7번: 입력 검사 → 규칙 실행. Plan 작업 9번: AI 호출과 응답 점검까지 연결.
// 입력과 결과는 저장하지 않고, 서버 로그에도 입력 내용을 남기지 않는다.

import { judge } from "@/lib/judge";
import { parseSiteInput } from "@/lib/schema";

/** 오류 응답 (Design §6.2 형식) */
function errorResponse(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "입력값을 다시 확인해 주세요.", 400);
  }

  // 목록에 없는 값 등 형식이 틀린 입력만 400으로 거른다. 빈칸은 오류가 아니다.
  const input = parseSiteInput(body);
  if (!input) {
    return errorResponse("INVALID_INPUT", "입력값을 다시 확인해 주세요.", 400);
  }

  try {
    return Response.json(await judge(input));
  } catch {
    // AI 호출 실패 등. 판정을 지어내지 않고 안내만 돌려준다. (오류 내용에 입력이 섞일 수 있어 로그에 남기지 않는다.)
    return errorResponse("SERVER_ERROR", "일시적인 오류입니다. 다시 시도해 주세요.", 500);
  }
}
