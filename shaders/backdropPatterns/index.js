/**
 * The patterns the backdrop's lines can draw, by the name BACKDROP.pattern
 * uses. Each is a GLSL chunk defining
 *
 *   float backdropPattern(vec2 q, vec3 dir)
 *
 * which returns how much line colour to add, given the planar coordinates
 * and the view direction, both already bent by the gravity well and the
 * pulse ripple. A chunk can #define WELL_CHARGE 0.0 to bend in its own way
 * while charging. See backdropFragmentShader.js for the uniforms they share,
 * and gridLine.js and cellLight.js for the helpers.
 */

import { lines } from "./lines.js";
import { grid } from "./grid.js";
import { horizon } from "./horizon.js";
import { tunnel } from "./tunnel.js";
import { room } from "./room.js";
import { contours } from "./contours.js";
import { dots } from "./dots.js";
import { hex } from "./hex.js";
import { weave } from "./weave.js";
import { rays } from "./rays.js";

export const BACKDROP_PATTERNS = { lines, grid, dots, hex, weave, rays, horizon, tunnel, room, contours };
