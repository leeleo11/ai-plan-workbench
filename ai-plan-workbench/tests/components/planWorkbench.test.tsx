import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlanWorkbench } from "@/components/plan/PlanWorkbench";
import { samplePlan } from "@/lib/plan/fixtures";

vi.mock("@/lib/storage/localPlanStore", () => ({
  savePlan: vi.fn()
}));

describe("PlanWorkbench", () => {
  it("lets users return to the goal input and generate a different plan", async () => {
    const onRestart = vi.fn();

    render(<PlanWorkbench initialPlan={samplePlan} onRestart={onRestart} />);

    await userEvent.click(screen.getByRole("button", { name: "换个目标" }));

    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("lets users check in a daily task directly from the timeline", async () => {
    render(<PlanWorkbench initialPlan={samplePlan} />);

    await userEvent.click(screen.getAllByRole("button", { name: "打卡通关" })[0]);

    expect(screen.getByText("已完成 50%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "撤销打卡" })).toBeInTheDocument();
  });

  it("can send a quality action into the optimization instruction box", async () => {
    render(<PlanWorkbench initialPlan={samplePlan} />);

    await userEvent.click(screen.getByRole("button", { name: "老师批注" }));
    await userEvent.click(screen.getByRole("button", { name: "使用动作" }));

    expect(screen.getByRole("textbox")).toHaveValue("执行前三天后，根据实际完成情况微调任务时长和优先级。");
  });

  it("filters the timeline by task status", async () => {
    render(<PlanWorkbench initialPlan={samplePlan} />);

    await userEvent.click(screen.getAllByRole("button", { name: "打卡通关" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "待挑战" }));

    expect(screen.queryByText("学习 Python 数据分析的一个核心概念")).not.toBeInTheDocument();
    expect(screen.getAllByText("完成一组 Python 数据分析配套练习").length).toBeGreaterThan(0);
  });
});
