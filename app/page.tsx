// Design Ref: §5.1 — 한 화면: 제목·안내 문구 → 부지 정보 입력 → 판별 결과
// 디자인: 검은 우주 + 아래에서 떠오르는 일식(오렌지 코로나) 배경, 어두운 유리 카드.
import JudgeScreen from "@/components/JudgeScreen";

/** 불씨 위치·속도 (장식이므로 고정 값으로 둔다) */
const EMBERS = [
  { left: "14%", delay: "0s", duration: "9s" },
  { left: "27%", delay: "2.5s", duration: "11s" },
  { left: "41%", delay: "5s", duration: "8s" },
  { left: "63%", delay: "1.2s", duration: "10s" },
  { left: "78%", delay: "4s", duration: "12s" },
  { left: "88%", delay: "6.5s", duration: "9s" },
];

/** 배경 장식: 화면 맨 아래에서 떠오르는 일식과 불씨. 글자 뒤에 고정되며 읽기 도구에는 숨긴다. */
function EclipseBackdrop() {
  return (
    <div className="eclipse-layer" aria-hidden="true">
      <div className="eclipse-plate" />
      <div className="eclipse-veil" />
      {EMBERS.map((ember) => (
        <span key={ember.left} className="ember" style={{ left: ember.left, animationDelay: ember.delay, animationDuration: ember.duration }} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 justify-center">
      <EclipseBackdrop />

      <main className="relative z-10 w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <header className="rise-in mb-10 text-center sm:mb-14">
          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl">
            신재생에너지 발전시설
            <br />
            대부 가능 여부 판별기
          </h1>
          <p className="mt-5 text-lg text-[var(--text-dim)]">
            업무지침 등에 따른 1차 확인용입니다.
            <br />
            최종 판단은 담당자가 합니다.
          </p>
        </header>

        <div className="rise-in glass p-5 sm:p-8" style={{ animationDelay: "0.15s" }}>
          <JudgeScreen />
        </div>
      </main>
    </div>
  );
}
