import { describe, expect, it } from "vitest";
import { Font } from "three/addons/loaders/FontLoader.js";
import { CORE } from "../constants.js";
import { GLYPHS } from "../assets/glyphs.js";
import { GLYPH_CANDIDATES } from "../assets/glyphCandidates.js";

describe("glyphs", () => {
  it("has the default glyph", () => {
    expect(GLYPHS[CORE.glyph]).toBeDefined();
  });

  // One closed outline with no holes extrudes cleanly; a stray contour would
  // be taken for a hole or a second letter
  it.each(Object.entries({ ...GLYPHS, ...GLYPH_CANDIDATES }))(
    "%s is a single solid S of sensible height",
    (name, data) => {
      const shapes = new Font(data).generateShapes("S", 1);
      expect(shapes).toHaveLength(1);
      expect(shapes[0].holes).toHaveLength(0);
      const ys = shapes[0].getPoints().map((p) => p.y);
      const height = Math.max(...ys) - Math.min(...ys);
      expect(height).toBeGreaterThan(0.5);
      expect(height).toBeLessThan(1.2);
    }
  );
});
