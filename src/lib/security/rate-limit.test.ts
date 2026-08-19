import { beforeEach, describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimits } from "./rate-limit";

describe("rate limiter", () => {
  beforeEach(() => resetRateLimits());

  it("allows only the configured number within a window", () => {
    expect(consumeRateLimit("user-1", 2, 1000, 10)).toBe(true);
    expect(consumeRateLimit("user-1", 2, 1000, 20)).toBe(true);
    expect(consumeRateLimit("user-1", 2, 1000, 30)).toBe(false);
    expect(consumeRateLimit("user-1", 2, 1000, 1010)).toBe(true);
  });

  it("isolates keys", () => {
    expect(consumeRateLimit("family-a", 1, 1000, 10)).toBe(true);
    expect(consumeRateLimit("family-b", 1, 1000, 10)).toBe(true);
  });
});
