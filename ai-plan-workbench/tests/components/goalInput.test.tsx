import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GoalInput } from "@/components/plan/GoalInput";

describe("GoalInput", () => {
  it("sends explicit level, duration, and daily time fields as part of the plan request", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: "stop after request capture" })
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<GoalInput onGenerated={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText("大目标"));
    await userEvent.type(screen.getByLabelText("大目标"), "学会 Python 数据分析");
    await userEvent.clear(screen.getByLabelText("开始日期"));
    await userEvent.type(screen.getByLabelText("开始日期"), "2026-06-08");
    await userEvent.clear(screen.getByLabelText("计划天数"));
    await userEvent.type(screen.getByLabelText("计划天数"), "60");
    await userEvent.clear(screen.getByLabelText("当前水平"));
    await userEvent.type(screen.getByLabelText("当前水平"), "会一点基础语法");
    await userEvent.clear(screen.getByLabelText("目标水平"));
    await userEvent.type(screen.getByLabelText("目标水平"), "能独立完成项目");
    await userEvent.clear(screen.getByLabelText("每天投入小时"));
    await userEvent.type(screen.getByLabelText("每天投入小时"), "2");
    await userEvent.click(screen.getByRole("button", { name: "生成我的闯关计划" }));

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.input).toContain("2026-06-08开始");
    expect(body.input).toContain("60天");
    expect(body.input).toContain("从会一点基础语法到能独立完成项目");
    expect(body.input).toContain("每天投入2小时");
  });

  it("notifies parent when generation fails so loading screen can close", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ error: "request timeout" })
      }))
    );
    const onGenerateEnd = vi.fn();

    render(
      <GoalInput
        onGenerated={vi.fn()}
        onGenerateStart={vi.fn()}
        onGenerateEnd={onGenerateEnd}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "生成我的闯关计划" }));

    await waitFor(() => {
      expect(onGenerateEnd).toHaveBeenCalled();
    });
  });

  it("allows users to generate a rolling plan when duration is uncertain", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: "stop after request capture" })
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<GoalInput onGenerated={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "时间还不确定，先做 30 天滚动计划" }));
    await userEvent.click(screen.getByRole("button", { name: "生成我的闯关计划" }));

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.input).toContain("计划时长暂不确定");
    expect(body.input).toContain("30天滚动计划");
  });
});
