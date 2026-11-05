// Design Ref: §5.1 — 한 화면: 제목·안내 문구 → 부지 정보 입력 → 판별 결과
// 디자인: 국유지(필지·초록 땅)와 신재생에너지(태양·태양광 패널)를 그림으로 담은 머리말.
import JudgeScreen from "@/components/JudgeScreen";

/** 머리말 그림: 해, 태양광 패널, 필지로 나뉜 땅. 장식이므로 화면 읽기 도구에는 숨긴다. */
function HeroArt() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-y-0 right-0 h-full w-3/5 opacity-70 sm:w-1/2 sm:opacity-100" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd36b" />
          <stop offset="100%" stopColor="#f5a623" />
        </radialGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b7f6a" />
          <stop offset="100%" stopColor="#1d4f40" />
        </linearGradient>
      </defs>
      {/* 해와 햇살 */}
      <circle cx="318" cy="64" r="64" fill="#f5a623" opacity="0.14" />
      <circle cx="318" cy="64" r="40" fill="#f5a623" opacity="0.22" />
      <circle cx="318" cy="64" r="24" fill="url(#sun)" />
      {/* 필지로 나뉜 땅 */}
      <path d="M0 170 L400 150 L400 220 L0 220 Z" fill="#1b5a40" opacity="0.9" />
      <path d="M0 190 L400 176 L400 220 L0 220 Z" fill="#14472f" />
      <g stroke="#9bd3b4" strokeOpacity="0.35" strokeWidth="1" fill="none">
        <path d="M70 172 L52 220" />
        <path d="M170 166 L160 220" />
        <path d="M270 160 L272 220" />
        <path d="M360 154 L390 220" />
        <path d="M0 198 L400 183" />
      </g>
      {/* 태양광 패널 */}
      <g transform="translate(212 100) skewX(-14)">
        <rect x="0" y="0" width="150" height="62" rx="3" fill="url(#panel)" stroke="#9bd3b4" strokeOpacity="0.5" />
        <g stroke="#cfeedd" strokeOpacity="0.45" strokeWidth="1">
          <path d="M30 0 V62 M60 0 V62 M90 0 V62 M120 0 V62" />
          <path d="M0 15.5 H150 M0 31 H150 M0 46.5 H150" />
        </g>
        <path d="M70 62 V92 M80 62 V92" stroke="#cfeedd" strokeOpacity="0.5" strokeWidth="3" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 justify-center px-4 py-6 sm:px-8 sm:py-12">
      <main className="w-full max-w-3xl">
        <header className="rise-in relative mb-6 overflow-hidden rounded-2xl bg-[var(--brand-deep)] px-6 py-8 text-white sm:px-10 sm:py-12">
          <HeroArt />
          <div className="relative max-w-[26rem]">
            <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              신재생에너지 발전시설
              <br />
              대부 가능 여부 판별기
            </h1>
            <p className="mt-3 text-base text-emerald-50/80">
              업무지침에 따른 1차 확인용입니다.
              <br />
              최종 판단은 담당자가 합니다.
            </p>
          </div>
        </header>

        <div className="rise-in rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8" style={{ animationDelay: "0.1s" }}>
          <JudgeScreen />
        </div>
      </main>
    </div>
  );
}
