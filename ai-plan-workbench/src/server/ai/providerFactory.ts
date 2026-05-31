import type { AiProvider } from "./provider";
import { createMockAiProvider } from "./mockProvider";

export function createAiProvider(): AiProvider {
  return createMockAiProvider();
}
