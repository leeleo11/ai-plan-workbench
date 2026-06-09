import { describe, expect, it } from "vitest";
import { parseGoalInput } from "@/lib/plan/parser";
import { selectTemplate } from "@/lib/plan/templates";

describe("parseGoalInput", () => {
  it("extracts IELTS, target score, current score, duration, and daily time", () => {
    const parsed = parseGoalInput("I want to prepare for IELTS for 90 days, improve from 5.5 to 7.0, and study 2 hours per day.");

    expect(parsed.goalType).toBe("exam");
    expect(parsed.examKeyword).toBe("ielts");
    expect(parsed.durationDays).toBe(90);
    expect(parsed.currentLevel).toBe("5.5");
    expect(parsed.targetLevel).toBe("7.0");
    expect(parsed.dailyAvailableMinutes).toBe(120);
  });

  it("extracts an explicit start date when provided", () => {
    const parsed = parseGoalInput("2026-06-08开始，30天学会 Python 数据分析，每天学习1小时");

    expect(parsed.startDate).toBe("2026-06-08");
    expect(parsed.durationDays).toBe(30);
  });

  it("supports uncertain planning duration as a rolling plan", () => {
    const parsed = parseGoalInput("备考雅思，备考时间不确定，每天学习2小时");

    expect(parsed.durationUncertain).toBe(true);
    expect(parsed.durationDays).toBe(30);
  });

  it("falls back to skill learning when no exam keyword is present", () => {
    const parsed = parseGoalInput("Learn Python data analysis in 30 days, one hour every day.");
    const template = selectTemplate(parsed);

    expect(parsed.goalType).toBe("skill");
    expect(template.id).toBe("generic_skill");
  });
});
