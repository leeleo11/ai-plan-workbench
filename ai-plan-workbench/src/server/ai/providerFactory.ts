import type { AiProvider } from "./provider";
import { createMockAiProvider } from "./mockProvider";
import { createMimoAiProvider } from "./mimoProvider";

export function createAiProvider(): AiProvider {
  if (process.env.AI_PROVIDER === "mimo") {
    return createMimoAiProvider();
  }

  return createMockAiProvider();
}
