// Design Ref: §5.1 — 한 화면: 제목·안내 문구 → 부지 정보 입력 (결과 영역은 이후 작업에서 아래에 추가)
import SiteForm from "@/components/SiteForm";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-3xl bg-white px-4 py-10 sm:px-10 dark:bg-zinc-950">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            신재생에너지 발전시설 대부 가능 여부 판별기
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            1차 확인용입니다. 최종 판단은 담당자가 합니다.
          </p>
        </header>
        <SiteForm />
      </main>
    </div>
  );
}
