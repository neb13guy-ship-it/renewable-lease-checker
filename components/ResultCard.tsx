// Design Ref: §5.1, §5.3, §5.4 — 판별 결과 표시: 판정 배지, 설명, 기본검토사항(근거), 제한 사유, 참고 메모.
// 화면에서는 "근거 조항"을 "기본검토사항"이라 부르고, "제N조" 대신 숫자(1., 2., ...)로만 표시한다.
// Plan 작업 10번: 결과 화면. 서버에서 받은 결과(JudgeResult)를 그대로 보여 주기만 한다.

import type { Citation, JudgeResult, Verdict } from "@/types/judge";

/** 판정별 모양: 가능=초록, 불가=빨강, 추가 확인 필요=노랑. 색만으로 구분하지 않도록 기호도 함께 쓴다. */
const VERDICT_STYLE: Record<Verdict, { panel: string; badge: string; mark: string }> = {
  가능: {
    panel: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
    badge: "bg-green-600 text-white",
    mark: "✓",
  },
  불가: {
    panel: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
    badge: "bg-red-600 text-white",
    mark: "✕",
  },
  "추가 확인 필요": {
    panel: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
    badge: "bg-amber-500 text-white",
    mark: "!",
  },
};

/** 조항 목록 한 묶음 (조항 번호와 원문 문장을 그대로 보여 준다) */
function CitationList({ title, items }: { title: string; items: Citation[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.article}
            className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3 text-base text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              {item.article}
            </span>
            <span>“{item.text}”</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ResultCard({ result }: { result: JudgeResult }) {
  const style = VERDICT_STYLE[result.verdict];
  return (
    <section aria-label="판별 결과" className="rise-in flex flex-col gap-6 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        <span className="accent-bar h-5 w-1 rounded-full" aria-hidden="true" />
        판별 결과
      </h2>

      <div className={`rounded-xl border p-5 ${style.panel}`}>
        <p className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-lg font-semibold ${style.badge}`}>
          <span aria-hidden="true">{style.mark}</span>
          {result.verdict}
        </p>
        <p className="mt-3 text-base leading-7 text-zinc-800 dark:text-zinc-200">{result.reasonSummary}</p>
      </div>

      <CitationList title="기본검토사항" items={result.citations} />
      <CitationList title="제한 사유" items={result.restrictions} />

      {result.memo.trim() !== "" && (
        <section>
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">참고 메모</h3>
          <p className="mt-3 whitespace-pre-wrap text-base text-zinc-800 dark:text-zinc-200">{result.memo}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">참고용이며 판정에는 쓰지 않았습니다.</p>
        </section>
      )}

      <p className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-base font-semibold text-orange-800 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-200">
        1차 확인 결과입니다. 최종 판단은 담당자가 합니다.
      </p>
    </section>
  );
}
