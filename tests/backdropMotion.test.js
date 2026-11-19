import { afterEach, describe, expect, it } from "vitest";
import { Quaternion, Vector2, Vector3 } from "three";
import { BACKDROP } from "../constants.js";
import {
  backdropPoint,
  createBackdropMotion,
  spinAboveIdle,
  stepBackdropMotion,
} from "../utils/backdropMotion.js";

const original = structuredClone(BACKDROP);
const DT = 1 / 60;
const RADIUS = 40;

afterEach(() => {
  Object.assign(BACKDROP, original);
});

function run(state, seconds, omega, motionScale = 1) {
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    stepBackdropMotion(state, { dt: DT, omega, motionScale });
  }
  return state;
}

describe("backdrop motion", () => {
  const resting = new Vector3(0.14, 0.34, 0.05);
  const thrown = new Vector3(0, 10, 0);

  it("moves the patterns at their speed while the cube tumbles idly", () => {
    BACKDROP.speed = 2;
    BACKDROP.spinBoost = 1;
    expect(spinAboveIdle(resting)).toBe(0);
    expect(run(createBackdropMotion(), 1, resting).flow).toBeCloseTo(2, 5);
    expect(run(createBackdropMotion(), 1, resting, 0.35).flow).toBeCloseTo(0.7, 5);
  });

  it("speeds them up while the cube spins fast, by spinBoost", () => {
    BACKDROP.spinBoost = 0.5;
    const flow = run(createBackdropMotion(), 1, thrown).flow;
    expect(flow).toBeCloseTo(1 + 0.5 * spinAboveIdle(thrown), 5);
    BACKDROP.spinBoost = 0;
    expect(run(createBackdropMotion(), 1, thrown).flow).toBeCloseTo(1, 5);
  });

  it("turns the room by the fraction of the cube's spin it follows", () => {
    BACKDROP.follow = 0.25;
    const state = createBackdropMotion();
    const start = state.room.clone();
    run(state, 1, new Vector3(0, 2, 0));
    const turned = start.clone().invert().premultiply(state.room);
    expect(2 * Math.acos(Math.min(1, Math.abs(turned.w)))).toBeCloseTo(0.5, 4);

    BACKDROP.follow = 0;
    const still = createBackdropMotion();
    run(still, 1, thrown);
    expect(still.room.angleTo(new Quaternion().copy(createBackdropMotion().room))).toBeCloseTo(0, 6);
  });
});

describe("backdropPoint", () => {
  it("puts a cube straight ahead of the camera at the backdrop's centre", () => {
    const q = backdropPoint(new Vector3(0, 0, 7.2), new Vector3(), RADIUS, new Vector2());
    expect(q.x).toBeCloseTo(0, 9);
    expect(q.y).toBeCloseTo(0, 9);
  });

  it("finds where the line of sight through the cube meets the backdrop", () => {
    const eye = new Vector3(0.5, 0.3, 7.2);
    const cube = new Vector3(0, 0.06, 0);
    const q = backdropPoint(eye, cube, RADIUS, new Vector2());
    // The shader's direction for q, out on the sphere, lies on the line of sight
    const hit = new Vector3(q.x, q.y, -1).normalize().multiplyScalar(RADIUS);
    const sight = cube.clone().sub(eye).normalize();
    const toHit = hit.clone().sub(eye).normalize();
    expect(toHit.distanceTo(sight)).toBeLessThan(1e-9);
    // Seen from the right and above, the cube lands left of and below the centre
    expect(q.x).toBeLessThan(0);
    expect(q.y).toBeLessThan(0.06);
  });
});
