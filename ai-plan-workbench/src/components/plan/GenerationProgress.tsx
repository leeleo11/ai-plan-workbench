const steps = [
  ["读目标", "把你的目标、水平和时间装进小纸条"],
  ["写简案", "MiMo 正在整理文字版规划和假设"],
  ["拆关卡", "本地计划代理把阶段拆成任务卡"],
  ["画时间线", "生成可以编辑、打卡的计划图表"]
];

export function GenerationProgress() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-3xl items-center justify-center">
      <div className="comic-border relative w-full overflow-hidden rounded-lg bg-white p-7 text-center md:p-8">
        <div className="absolute left-6 top-5 h-8 w-20 -rotate-6 rounded-full border-2 border-[var(--line)] bg-[var(--peach)] opacity-80" />
        <div className="absolute bottom-6 right-6 h-10 w-10 rotate-12 rounded-lg border-2 border-[var(--line)] bg-[var(--sky)] opacity-80" />

        <p className="relative text-sm font-black tracking-[0.25em] text-[var(--berry)]">AI 同桌正在开工</p>
        <h1 className="marker-title relative mt-3 text-4xl font-black text-[var(--ink)]">任务卡制作中...</h1>

        <div className="relative mx-auto mt-7 flex h-28 max-w-sm items-end justify-center gap-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-20 w-16 animate-bounce rounded-lg border-2 border-[var(--line)] bg-[var(--sun)] shadow-[3px_3px_0_var(--line)]"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="mx-auto mt-3 h-2 w-9 rounded-full bg-[var(--line)]" />
              <div className="mx-auto mt-3 h-2 w-7 rounded-full bg-[var(--berry)]" />
              <div className="mx-auto mt-3 h-2 w-10 rounded-full bg-[var(--mint)]" />
            </div>
          ))}
        </div>

        <div className="paper-strip relative mt-8 rounded-lg border-2 border-[var(--line)] bg-[var(--paper)] p-5 text-left">
          <div className="grid gap-3">
            {steps.map(([title, desc], index) => (
              <div key={title} className="flex items-center gap-3 rounded-lg bg-white/75 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--line)] bg-[var(--mint)] text-sm font-black">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-base font-black text-[var(--ink)]">{title}</span>
                  <span className="block text-xs font-bold leading-5 text-stone-600">{desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-5 flex justify-center gap-2" aria-label="计划生成中">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-3 w-3 animate-pulse rounded-full border-2 border-[var(--line)] bg-[var(--berry)]"
              style={{ animationDelay: `${index * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
