import { describe, expect, it } from "vitest";
import { parseGoalInput } from "@/lib/plan/parser";
import { selectTemplate } from "@/lib/plan/templates";

describe("parseGoalInput", () => {
  it("extracts goal category, duration, and daily time", () => {
    const parsed = parseGoalInput("30天学会 Python 数据分析，从会一点基础语法到能独立完成一个小项目，每天学习1小时");

    expect(parsed.goalCategory).toBe("learning");
    expect(parsed.durationDays).toBe(30);
    expect(parsed.dailyAvailableMinutes).toBe(60);
  });

  it("extracts an explicit start date when provided", () => {
    const parsed = parseGoalInput("2026-06-08开始，30天学会 Python 数据分析，每天学习1小时");

    expect(parsed.startDate).toBe("2026-06-08");
    expect(parsed.durationDays).toBe(30);
  });

  it("supports uncertain planning duration as a rolling plan", () => {
    const parsed = parseGoalInput("养成晨跑习惯，时间不确定，每天投入1小时");

    expect(parsed.durationUncertain).toBe(true);
    expect(parsed.durationDays).toBe(30);
  });

  it("detects habit goals", () => {
    const parsed = parseGoalInput("30天养成晨跑习惯");
    const template = selectTemplate(parsed.goalCategory);

    expect(parsed.goalCategory).toBe("habit");
    expect(template.id).toBe("habit");
  });

  it("detects project goals", () => {
    const parsed = parseGoalInput("60天完成一个Side Project");

    expect(parsed.goalCategory).toBe("project");
  });

  it("detects health goals", () => {
    const parsed = parseGoalInput("30天减重5斤，每天运动1小时");

    expect(parsed.goalCategory).toBe("health");
  });

  it("defaults to custom for unrecognized goals", () => {
    const parsed = parseGoalInput("整理一下房间");

    expect(parsed.goalCategory).toBe("custom");
  });
});
