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
  { left: "20%", delay: "3.2s", duration: "10s" },
  { left: "50%", delay: "7s", duration: "11s" },
  { left: "70%", delay: "0.6s", duration: "8s" },
  { left: "94%", delay: "4.4s", duration: "12s" },
];

/** 별 위치를 만드는 간단한 난수(같은 값이 나오므로 화면을 다시 그려도 별이 그대로다). */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** 별빛: 화면 전체에 흩어진 별(box-shadow 목록). 은하수 띠 근처에는 별가루를 더 촘촘하게 둔다. */
function makeStars(count: number, seed: number, dust: boolean): string {
  const random = makeRandom(seed);
  const stars: string[] = [];
  for (let i = 0; i < count; i++) {
    let x = random() * 100;
    let y = random() * 78;
    if (dust) {
      // 은하수 띠(왼쪽 위에서 오른쪽 아래로 비스듬히)를 따라 모이게 한다.
      const t = random();
      const spread = (random() + random() + random() - 1.5) * 9;
      x = t * 100;
      y = 18 + t * 30 + spread;
    }
    const tone = random() > 0.75 ? "#ffd9b0" : random() > 0.5 ? "#cfd8ff" : "#ffffff";
    stars.push(`${x.toFixed(1)}vw ${y.toFixed(1)}vh 0 0 ${tone}`);
  }
  return stars.join(',');
}

const STARS_SMALL = makeStars(90, 11, false);
const STARS_BRIGHT = makeStars(26, 23, false);
const STARS_DUST = makeStars(160, 37, true);

/** 배경 장식: 화면 맨 아래에서 떠오르는 일식과 불씨. 글자 뒤에 고정되며 읽기 도구에는 숨긴다. */
function EclipseBackdrop() {
  return (
    <div className="eclipse-layer" aria-hidden="true">
      <div className="eclipse-plate" />
      <div className="eclipse-heat" />
      <div className="eclipse-veil" />
      <div className="milkyway" />
      <div className="star-layer" style={{ boxShadow: STARS_DUST, opacity: 0.85 }} />
      <div className="star-layer" style={{ boxShadow: STARS_SMALL, opacity: 1 }} />
      <div className="star-layer star-twinkle" style={{ boxShadow: STARS_BRIGHT, width: 2, height: 2 }} />
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
