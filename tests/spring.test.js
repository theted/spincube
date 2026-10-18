import { describe, expect, it } from "vitest";
import { approachFactor, stepSpring } from "../utils/spring.js";

function simulate(stiffness, damping, dt, seconds) {
  const spring = { value: 0, velocity: 0 };
  let peak = 0;
  for (let t = 0; t < seconds; t += dt) {
    stepSpring(spring, 1, stiffness, damping, dt);
    peak = Math.max(peak, spring.value);
  }
  return { ...spring, peak };
}

describe("stepSpring", () => {
  it("settles on the target", () => {
    const { value, velocity } = simulate(220, 9, 1 / 60, 3);
    expect(value).toBeCloseTo(1, 3);
    expect(velocity).toBeCloseTo(0, 2);
  });

  it("overshoots when underdamped and not when overdamped", () => {
    expect(simulate(220, 9, 1 / 60, 2).peak).toBeGreaterThan(1.2);
    expect(simulate(70, 40, 1 / 60, 2).peak).toBeLessThanOrEqual(1);
  });

  it("behaves the same at 30, 60 and 144 fps", () => {
    const at60 = simulate(220, 9, 1 / 60, 0.25).value;
    expect(simulate(220, 9, 1 / 30, 0.25).value).toBeCloseTo(at60, 1);
    expect(simulate(220, 9, 1 / 144, 0.25).value).toBeCloseTo(at60, 1);
  });

  it("stays stable for a very long frame", () => {
    const spring = { value: 0, velocity: 0 };
    stepSpring(spring, 1, 220, 9, 0.5);
    expect(Math.abs(spring.value)).toBeLessThan(3);
  });
});

describe("approachFactor", () => {
  it("compounds the same over one long step or many short ones", () => {
    const once = approachFactor(3, 0.1);
    const tenTimes = 1 - (1 - approachFactor(3, 0.01)) ** 10;
    expect(tenTimes).toBeCloseTo(once, 10);
  });
});
