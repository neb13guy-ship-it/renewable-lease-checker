// Design Ref: §5.1 — 한 화면: 제목·안내 문구 → 부지 정보 입력 → 판별 결과
import JudgeScreen from "@/components/JudgeScreen";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center px-4 py-8 sm:px-8 sm:py-14">
      <main className="w-full max-w-3xl">
        <header className="rise-in mb-8">
          <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.08em] text-zinc-500 uppercase dark:text-zinc-400">
            <span className="accent-bar inline-block h-2 w-2 rounded-full" aria-hidden="true" />
            국유재산 대부 · 1차 확인
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            신재생에너지 발전시설
            <br />
            대부 가능 여부 판별기
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">1차 확인용입니다. 최종 판단은 담당자가 합니다.</p>
          <div className="accent-bar mt-6 h-0.5 w-16 rounded-full" aria-hidden="true" />
        </header>

        <div className="rise-in rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8" style={{ animationDelay: "0.1s" }}>
          <JudgeScreen />
        </div>
      </main>
    </div>
  );
}
