// Design Ref: §8 — 시험 사례(tests/cases.json)를 실행 중인 서버의 판별 API에 보내 정확도를 점검한다.
// Plan 작업 12번: 정확도 90%(18/20 이상), 근거(기본검토사항) 제시율 100%, 응답 시간을 확인한다.
//
// 사용법 (개발 서버를 먼저 켜 둔다):
//   node tests/run-cases.mjs                      → http://localhost:3000 으로 1회씩
//   node tests/run-cases.mjs http://localhost:3001 → 주소를 지정
//   node tests/run-cases.mjs http://localhost:3001 3 → 사례마다 3회씩 보내 결과가 일정한지도 확인
// 실제 AI를 호출하는 사례가 있어 호출 비용이 조금 든다. 서버를 켜지 않고 돌리면 모두 실패로 나온다.

import { readFileSync } from "node:fs";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const repeat = Number(process.argv[3] ?? 1);
const { cases } = JSON.parse(readFileSync(new URL("./cases.json", import.meta.url), "utf-8"));

async function ask(input) {
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}/api/judge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    return { ok: response.ok, data, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, data: { error: { message: String(error?.message ?? error) } }, ms: Date.now() - started };
  }
}

let correct = 0;
let withCitation = 0;
let total = 0;
let totalMs = 0;
let slowest = 0;
const groupStats = new Map();
const failures = [];

for (const testCase of cases) {
  const verdicts = [];
  for (let i = 0; i < repeat; i++) {
    const { ok, data, ms } = await ask(testCase.input);
    const verdict = ok ? data.verdict : `오류(${data?.error?.code ?? "연결 실패"})`;
    const hasCitation = ok && Array.isArray(data.citations) && data.citations.length > 0;
    verdicts.push(verdict);

    total += 1;
    totalMs += ms;
    slowest = Math.max(slowest, ms);
    if (verdict === testCase.expected) correct += 1;
    if (hasCitation) withCitation += 1;

    const stat = groupStats.get(testCase.group) ?? { ok: 0, all: 0 };
    stat.all += 1;
    if (verdict === testCase.expected) stat.ok += 1;
    groupStats.set(testCase.group, stat);

    if (verdict !== testCase.expected) {
      failures.push({ id: testCase.id, name: testCase.name, expected: testCase.expected, got: verdict, reason: ok ? data.reasonSummary : data?.error?.message });
    }
  }
  const mark = verdicts.every((v) => v === testCase.expected) ? "✅" : "❌";
  console.log(`${mark} ${String(testCase.id).padStart(2)}. [${testCase.group}] ${testCase.name} → 정답 ${testCase.expected} / 결과 ${verdicts.join(", ")}`);
}

const accuracy = (correct / total) * 100;
const citationRate = (withCitation / total) * 100;
console.log("\n──────── 요약 ────────");
console.log(`정확도: ${correct}/${total} (${accuracy.toFixed(0)}%)  ← 기준 90% 이상`);
console.log(`기본검토사항(근거) 제시율: ${withCitation}/${total} (${citationRate.toFixed(0)}%)  ← 기준 100%`);
console.log(`응답 시간: 평균 ${(totalMs / total / 1000).toFixed(1)}초, 최대 ${(slowest / 1000).toFixed(1)}초`);
for (const [group, stat] of groupStats) console.log(`  - ${group}: ${stat.ok}/${stat.all}`);

if (failures.length > 0) {
  console.log("\n──────── 틀린 사례 ────────");
  for (const f of failures) console.log(`#${f.id} ${f.name}: 정답 ${f.expected} / 결과 ${f.got}\n   사유: ${f.reason}`);
}

const passed = accuracy >= 90 && citationRate === 100;
console.log(`\n${passed ? "✅ 통과" : "❌ 기준 미달"}`);
process.exit(passed ? 0 : 1);
