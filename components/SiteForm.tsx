"use client";

// Design Ref: §5.1, §5.4 — 부지 정보 입력 화면 (필수 6개 + 참고 메모).
// Plan 작업 6번: 입력 화면. Plan 작업 10번: [판별하기]를 누르면 입력을 바깥(JudgeScreen)으로 넘겨 판별 API에 연결한다.

import { useState } from "react";
import { LAND_CATEGORIES, SITE_STATUSES } from "@/data/siteOptions";
import type { SiteInput } from "@/types/judge";

/** 처음에는 아무것도 고르지 않은 상태 */
const EMPTY_INPUT: SiteInput = {
  landCategory: "",
  siteStatus: "",
  housingWithin200m: null,
  neighborOwner: null,
  isProtectedZone: null,
  localPermitPossible: null,
  memo: "",
};

const selectClass =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50";

/** 두 가지 중 하나를 고르는 라디오 묶음 */
function RadioGroup<T extends string | boolean>(props: {
  legend: string;
  hint?: string;
  value: T | null;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  const { legend, hint, value, options, onChange } = props;
  return (
    <fieldset>
      <legend className="text-base font-medium text-zinc-900 dark:text-zinc-50">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <label key={option.label} className="flex items-center gap-2 text-base text-zinc-800 dark:text-zinc-200">
            <input
              type="radio"
              name={legend}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function SiteForm(props: {
  /** [판별하기]를 눌렀을 때, 입력한 내용을 넘겨받는다. */
  onSubmit: (input: SiteInput) => void;
  /** 판별하는 중이면 true (버튼을 잠근다) */
  loading: boolean;
}) {
  const { onSubmit, loading } = props;
  const [input, setInput] = useState<SiteInput>(EMPTY_INPUT);

  /** 항목 하나만 바꾼다. */
  function update<K extends keyof SiteInput>(key: K, value: SiteInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(input);
      }}
    >
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">부지 정보 입력</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-base font-medium text-zinc-900 dark:text-zinc-50">
          지목
          <select
            className={selectClass}
            value={input.landCategory}
            onChange={(event) => update("landCategory", event.target.value)}
          >
            <option value="">선택해 주세요</option>
            {LAND_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-base font-medium text-zinc-900 dark:text-zinc-50">
          부지 현황
          <select
            className={selectClass}
            value={input.siteStatus}
            onChange={(event) => update("siteStatus", event.target.value)}
          >
            <option value="">선택해 주세요</option>
            {SITE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <RadioGroup
        legend="국토계획법상 주거지역"
        hint="지역불문하고 인접지에 주택이 없으며 주택은 담당자가 판단해서 선택합니다."
        value={input.housingWithin200m}
        options={[
          { label: "해당함", value: true },
          { label: "해당하지 않음", value: false },
        ]}
        onChange={(value) => update("housingWithin200m", value)}
      />

      <RadioGroup
        legend="인접지 소유자"
        hint="인접지가 여러 필지이면 한 필지라도 신청자와 다를 때 '다름'을 선택합니다. 이름은 입력하지 않습니다."
        value={input.neighborOwner}
        options={[
          { label: "신청자와 같음", value: "same" as const },
          { label: "신청자와 다름", value: "different" as const },
        ]}
        onChange={(value) => update("neighborOwner", value)}
      />

      <RadioGroup
        legend="기타 주변 민원 가능성"
        hint="경관훼손, 전자파 노출, 반사광, 열섬현상, 주변 동식물 영향 등"
        value={input.isProtectedZone}
        options={[
          { label: "있음", value: true },
          { label: "없음", value: false },
        ]}
        onChange={(value) => update("isProtectedZone", value)}
      />

      <RadioGroup
        legend="지자체의 발전시설 허가 등이 가능한지 사전 확인 결과"
        value={input.localPermitPossible}
        options={[
          { label: "예", value: true },
          { label: "아니오", value: false },
        ]}
        onChange={(value) => update("localPermitPossible", value)}
      />

      <label className="block text-base font-medium text-zinc-900 dark:text-zinc-50">
        참고 메모 (장기 대부 시 향후 활용 가능성·민원 소지)
        <span className="mt-0.5 block text-sm font-normal text-zinc-500 dark:text-zinc-400">
          결과와 함께 보여 줄 뿐 판정에는 쓰지 않습니다. 성명·연락처·주민등록번호 등 개인정보는 적지 마세요.
        </span>
        <textarea
          className={`${selectClass} min-h-24`}
          value={input.memo}
          onChange={(event) => update("memo", event.target.value)}
        />
      </label>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-md bg-zinc-900 px-6 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "확인하는 중..." : "판별하기"}
        </button>
      </div>
    </form>
  );
}
