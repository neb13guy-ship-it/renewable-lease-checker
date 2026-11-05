"use client";

// Design Ref: §5.3 — 입력 화면과 결과 화면을 조립하고, 판별 API를 호출한다.
// Plan 작업 10번: [판별하기] → POST /api/judge → 결과 표시. 입력과 결과는 화면 안에서만 쓰고 어디에도 저장하지 않는다.

import { useRef, useState } from "react";
import ResultCard from "@/components/ResultCard";
import SiteForm from "@/components/SiteForm";
import type { JudgeResult, SiteInput } from "@/types/judge";

const FALLBACK_ERROR = "일시적인 오류입니다. 다시 시도해 주세요.";

export default function JudgeScreen() {
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(input: SiteInput) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? FALLBACK_ERROR);
      } else {
        setResult(data as JudgeResult);
      }
    } catch {
      // 네트워크 오류 등: 결과를 만들지 않고 안내만 보여 준다.
      setError(FALLBACK_ERROR);
    } finally {
      setLoading(false);
      // 결과(또는 오류)가 화면 아래에 있으므로 보이는 위치로 이동한다.
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <SiteForm onSubmit={handleSubmit} loading={loading} />
      <div ref={resultRef} aria-live="polite">
        {error && (
          <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-base text-red-900 dark:bg-red-950 dark:text-red-100">
            {error}
          </p>
        )}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
