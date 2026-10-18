import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { CAMERA, PULSE, SPIN } from "../constants.js";
import {
  cancelCharge,
  createMotion,
  dragMotion,
  pressMotion,
  releaseMotion,
  stepMotion,
  zoomMotion,
} from "../utils/motion.js";

const camera = new Vector3(0, 0, CAMERA.distance);
const DT = 1 / 60;

function run(motion, seconds, { isDragging = false, startTime = 0 } = {}) {
  let time = startTime;
  for (let t = 0; t < seconds; t += DT) {
    time += DT;
    stepMotion(motion, { dt: DT, time, isDragging, cameraPosition: camera });
  }
  return time;
}

describe("motion", () => {
  it("charges while held and releases a stronger pulse for a longer hold", () => {
    const quick = createMotion();
    pressMotion(quick);
    run(quick, 0.05);
    const quickStrength = releaseMotion(quick, { wasDrag: false }, () => 0.5);

    const held = createMotion();
    pressMotion(held);
    run(held, 2);
    expect(held.charge).toBe(1);
    const heldStrength = releaseMotion(held, { wasDrag: false }, () => 0.5);

    expect(quickStrength).toBeGreaterThanOrEqual(PULSE.minStrength);
    expect(heldStrength).toBeCloseTo(1, 5);
    expect(held.pulse.time).toBe(0);
    expect(held.charge).toBe(0);
  });

  it("drops the charge when the press becomes a drag", () => {
    const motion = createMotion();
    pressMotion(motion);
    run(motion, 0.5);
    cancelCharge(motion);
    run(motion, 0.5, { isDragging: true });
    expect(motion.charge).toBe(0);
  });

  it("throws with the drag speed, capped, then settles back to the idle tumble", () => {
    const motion = createMotion();
    const perFrame = new Vector3(0, 0.05, 0); // 3 rad/s
    for (let i = 0; i < 30; i++) dragMotion(motion, perFrame, DT);
    expect(motion.throwOmega.y).toBeCloseTo(3, 1);

    releaseMotion(motion, { wasDrag: true });
    expect(motion.cubeOmega.y).toBeCloseTo(3, 1);
    expect(motion.cubeOmega.length()).toBeLessThanOrEqual(SPIN.maxThrow);

    run(motion, 8);
    expect(motion.cubeOmega.length()).toBeLessThan(1);
  });

  it("keeps the S facing the camera when idle", () => {
    const motion = createMotion();
    run(motion, 3);
    const front = new Vector3(0, 0, 1).applyQuaternion(motion.coreQuaternion);
    expect(front.z).toBeGreaterThan(0.9);
  });

  it("clamps the zoom and springs towards it", () => {
    const motion = createMotion();
    zoomMotion(motion, -1e6);
    expect(motion.zoomTarget).toBe(CAMERA.minDistance);
    run(motion, 2);
    expect(motion.zoom.value).toBeCloseTo(CAMERA.minDistance, 2);
  });
});
