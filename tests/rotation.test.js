import { describe, expect, it } from "vitest";
import { Quaternion, Vector3 } from "three";
import {
  dragToRotation,
  integrateRotation,
  rotationBetween,
  stepRotationSpring,
} from "../utils/rotation.js";

const FRONT = new Vector3(0, 0, 1);

describe("integrateRotation", () => {
  it("turns half a revolution at π rad/s over one second", () => {
    const q = new Quaternion();
    const omega = new Vector3(0, Math.PI, 0);
    for (let i = 0; i < 60; i++) integrateRotation(q, omega, 1 / 60);
    const front = FRONT.clone().applyQuaternion(q);
    expect(front.z).toBeCloseTo(-1, 5);
  });

  it("leaves the orientation alone without spin", () => {
    const q = new Quaternion(0.1, 0.2, 0.3, 0.9).normalize();
    const before = q.clone();
    integrateRotation(q, new Vector3(), 1);
    expect(q.equals(before)).toBe(true);
  });
});

describe("dragToRotation", () => {
  const camera = new Quaternion(); // Looking down -Z, like the default camera

  it("moves the front face right when dragging right", () => {
    const rotation = dragToRotation(100, 0, 0.005, camera, new Vector3());
    const front = FRONT.clone().applyQuaternion(
      integrateRotation(new Quaternion(), rotation, 1)
    );
    expect(front.x).toBeGreaterThan(0.4);
    expect(front.y).toBeCloseTo(0, 5);
  });

  it("moves the front face down when dragging down", () => {
    const rotation = dragToRotation(0, 100, 0.005, camera, new Vector3());
    const front = FRONT.clone().applyQuaternion(
      integrateRotation(new Quaternion(), rotation, 1)
    );
    expect(front.y).toBeLessThan(-0.4);
  });
});

describe("rotationBetween", () => {
  it("recovers an axis and angle", () => {
    const from = new Quaternion();
    const to = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.7);
    const rotation = rotationBetween(from, to, new Vector3());
    expect(rotation.x).toBeCloseTo(0.7, 6);
    expect(rotation.y).toBeCloseTo(0, 6);
  });

  it("takes the short way round", () => {
    const from = new Quaternion();
    const to = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 1.5 * Math.PI);
    const rotation = rotationBetween(from, to, new Vector3());
    expect(rotation.y).toBeCloseTo(-0.5 * Math.PI, 6);
  });
});

describe("stepRotationSpring", () => {
  it("brings an orientation back to its target", () => {
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 2);
    const omega = new Vector3(3, 0, 0);
    const target = new Quaternion();
    for (let i = 0; i < 300; i++) {
      stepRotationSpring(q, omega, target, { stiffness: 14, damping: 4.5 }, 1 / 60);
    }
    expect(q.angleTo(target)).toBeLessThan(0.01);
  });

  it("is dragged along by a coupled spinning body", () => {
    const q = new Quaternion();
    const omega = new Vector3();
    const params = { stiffness: 14, damping: 4.5, coupling: 1.6, driveOmega: new Vector3(0, 12, 0) };
    stepRotationSpring(q, omega, new Quaternion(), params, 0.1);
    expect(omega.y).toBeGreaterThan(0);
  });
});
