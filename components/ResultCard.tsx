// Design Ref: §5.1, §5.3, §5.4 — 판별 결과 표시: 판정 배지, 설명, 기본검토사항(근거), 제한 사유, 참고 메모.
// 화면에서는 "근거 조항"을 "기본검토사항"이라 부르고, "제N조" 대신 숫자(1., 2., ...)로만 표시한다.
// Plan 작업 10번: 결과 화면. 서버에서 받은 결과(JudgeResult)를 그대로 보여 주기만 한다.

import type { Citation, JudgeResult, Verdict } from "@/types/judge";

/** 판정별 배지 색: 가능=초록, 불가=빨강, 추가 확인 필요=노랑 */
const VERDICT_STYLE: Record<Verdict, string> = {
  가능: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100",
  불가: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
  "추가 확인 필요": "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
};

/** 조항 목록 한 묶음 (조항 번호와 원문 문장을 그대로 보여 준다) */
function CitationList({ title, items }: { title: string; items: Citation[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.article} className="rounded-md bg-zinc-50 px-4 py-3 text-base text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <span className="font-medium">{item.article}.</span> “{item.text}”
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ResultCard({ result }: { result: JudgeResult }) {
  return (
    <section aria-label="판별 결과" className="flex flex-col gap-5 rounded-lg border border-zinc-200 p-5 dark:border-zinc-700">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">판별 결과</h2>

      <p className={`self-start rounded-full px-4 py-1.5 text-lg font-semibold ${VERDICT_STYLE[result.verdict]}`}>
        {result.verdict}
      </p>

      <p className="text-base leading-7 text-zinc-800 dark:text-zinc-200">{result.reasonSummary}</p>

      <CitationList title="기본검토사항" items={result.citations} />
      <CitationList title="제한 사유" items={result.restrictions} />

      {result.memo.trim() !== "" && (
        <section>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">참고 메모</h3>
          <p className="mt-2 whitespace-pre-wrap text-base text-zinc-800 dark:text-zinc-200">{result.memo}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">참고용이며 판정에는 쓰지 않았습니다.</p>
        </section>
      )}

      <p className="text-sm text-zinc-500 dark:text-zinc-400">1차 확인 결과입니다. 최종 판단은 담당자가 합니다.</p>
    </section>
  );
}
