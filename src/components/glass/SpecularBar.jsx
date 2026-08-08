import { useEffect, useRef } from 'react';
import './SpecularBar.css';

// Specular rim ported from reactbits.dev/components/specular-button — the shader
// is the original's, re-hosted on raw WebGL2 (the source runs it through `ogl`)
// and wrapped around a plain container instead of a button. The frost itself is
// ordinary CSS: tint + backdrop blur. The canvas only draws the edge.

// The canvas overshoots the bar on all four sides so the rim glow can bleed past
// the edge instead of being clipped at it.
const PAD = 20;

// Where a frozen light sits: the corner diagonal, so the gleam lands on two opposite
// corners rather than in the middle of an edge. A constant rather than a function of
// the bar's shape — uNormalExp circularises the outline normal, so the corners are at
// 45°/135° in the space the shader measures angles in whatever the real aspect ratio.
// (The animated path's own aspect-corrected diagonal degenerates to straight-up on a
// bar this wide, which is why it is not reused here.)
const REST_ANGLE = (3 * Math.PI) / 4;

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;
uniform float uNormalExp;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both catch a
  // streak. The angular window (size + fade) is measured against an outline
  // normal so it varies continuously along straight edges. uNormalExp = 2 is the
  // true ellipse normal, which is what the original square-ish button used; a
  // bar this wide needs it circularised (~1) or the whole long edge lights at
  // once instead of a gleam travelling down it.
  vec2 nEll = normalize(p / pow(uHalfSize, vec2(uNormalExp)) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

// #rgb / #rrggbb -> [r, g, b] in 0..1. Falls back to white on anything unparseable.
const hexToRgb = (value) => {
  let hex = String(value).trim().replace('#', '');
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  const n = Number.parseInt(hex, 16);
  if (hex.length !== 6 || !Number.isFinite(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

function buildProgram(gl) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'shader compile failed');
    }
    return shader;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERT);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
  }
  return program;
}

// Whether the rim can actually paint here: WebGL2, plus a shader that compiles and
// links. Probed once on a throwaway context and cached, mirroring the capability
// check in ./glassSupport.js. Deliberately answered before first paint rather than
// discovered in an effect, so the fallback border is correct on frame one instead
// of appearing a frame late.
let rimSupport;

function canRenderRim() {
  if (typeof document === 'undefined') return false;
  if (rimSupport !== undefined) return rimSupport;

  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) {
    rimSupport = false;
    return false;
  }
  try {
    gl.deleteProgram(buildProgram(gl));
    rimSupport = true;
  } catch {
    rimSupport = false;
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return rimSupport;
}

/**
 * SpecularBar
 *
 * Frosted container whose border is a specular rim: a hairline stroke on the
 * rounded-rect outline with a highlight where the light catches it. Sizes itself
 * to its children — pass height/padding from the outside.
 *
 * Frost: tint, tintOpacity, blur, saturate, shadow (all plain CSS).
 * Rim: lineColor, baseColor, intensity, shineSize, shineFade, thickness, normalExp.
 * Light: frozen, plus speed / followMouse / proximity / autoAnimate for the
 * animated mode.
 *
 * With frozen (the default) the light is parked on the corner diagonal (REST_ANGLE)
 * and nothing — pointer or clock — moves it after that, so the canvas is drawn once
 * per size and palette rather than every frame.
 *
 * Degrades on its own: no WebGL2 leaves a plain 1px border, and
 * prefers-reduced-motion parks the light as though frozen were set.
 */
export default function SpecularBar({
  children,
  className = '',
  radius = 14,
  tint = '#ffffff',
  tintOpacity = 0.045,
  blur = 10,
  saturate = 1.2,
  shadow,
  lineColor = '#ffffff',
  baseColor = '#5c5c5c',
  intensity = 1,
  shineSize = 5,
  shineFade = 14,
  thickness = 1.1,
  normalExp = 1,
  frozen = true,
  speed = 0.35,
  followMouse = true,
  proximity = 320,
  autoAnimate = true,
}) {
  const barRef = useRef(null);
  const fxRef = useRef(null);
  const redrawRef = useRef(null);
  const propsRef = useRef(null);

  // The render loop is set up once and reads the live props off this ref, so that
  // retuning the rim never restarts (and resets) the light's sweep. Declared before
  // the setup effect below so it is always populated by the time that one draws.
  useEffect(() => {
    propsRef.current = {
      radius, lineColor, baseColor, intensity, shineSize, shineFade,
      thickness, normalExp, speed, followMouse, proximity, autoAnimate,
    };
  }, [
    radius, lineColor, baseColor, intensity, shineSize, shineFade,
    thickness, normalExp, speed, followMouse, proximity, autoAnimate,
  ]);

  useEffect(() => {
    const bar = barRef.current;
    const fx = fxRef.current;
    if (!bar || !fx || !canRenderRim()) return undefined;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    // The probe already built this exact program, so a failure here means the
    // context itself was refused (browser context limit). Leave the bar frosted
    // but rimless rather than throwing out of the effect.
    if (!gl) return undefined;
    let program;
    try {
      program = buildProgram(gl);
    } catch {
      return undefined;
    }

    gl.useProgram(program);
    const loc = (name) => gl.getUniformLocation(program, name);
    const uni = {
      center: loc('uCenter'),
      halfSize: loc('uHalfSize'),
      radius: loc('uRadius'),
      angle: loc('uAngle'),
      px: loc('uPx'),
      lineColor: loc('uLineColor'),
      baseColor: loc('uBaseColor'),
      intensity: loc('uIntensity'),
      shineSize: loc('uShineSize'),
      shineFade: loc('uShineFade'),
      thickness: loc('uThickness'),
      baseWidth: loc('uBaseWidth'),
      normalExp: loc('uNormalExp'),
    };

    // One full-screen triangle; the outline is drawn entirely in the fragment shader.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    fx.appendChild(canvas);

    // Frozen on request, and also whenever the visitor has asked for less motion.
    const still = frozen
      || (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

    const light = { angle: 2.4, idle: 2.4, bright: 0 };
    const size = { w: 1, h: 1, dpr: 1 };
    const resize = () => {
      // Fractional size + an explicit centre keep the SDF pinned to the exact CSS
      // border, instead of drifting up to a pixel from rounded offset widths.
      const rect = bar.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = rect.width;
      size.h = rect.height;
      size.dpr = dpr;
      canvas.width = Math.round((rect.width + PAD * 2) * dpr);
      canvas.height = Math.round((rect.height + PAD * 2) * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.center, (PAD + rect.width / 2) * dpr, (PAD + rect.height / 2) * dpr);
      gl.uniform2f(uni.halfSize, (rect.width / 2) * dpr, (rect.height / 2) * dpr);
      gl.uniform1f(uni.px, dpr);
      gl.uniform1f(uni.baseWidth, dpr);
    };

    const draw = () => {
      const p = propsRef.current;
      gl.uniform1f(uni.angle, light.angle);
      gl.uniform1f(uni.radius, Math.min(p.radius, Math.min(size.w, size.h) / 2) * size.dpr);
      gl.uniform3fv(uni.lineColor, hexToRgb(p.lineColor));
      gl.uniform3fv(uni.baseColor, hexToRgb(p.baseColor));
      gl.uniform1f(uni.intensity, p.intensity * light.bright);
      gl.uniform1f(uni.shineSize, (p.shineSize * Math.PI) / 180);
      gl.uniform1f(uni.shineFade, (p.shineFade * Math.PI) / 180);
      gl.uniform1f(uni.thickness, p.thickness * size.dpr);
      gl.uniform1f(uni.normalExp, p.normalExp);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw();
    });
    ro.observe(bar);
    resize();

    // Light angle steers toward the pointer (anywhere on the page) and falls back
    // to a slow sweep when the pointer hasn't moved yet.
    let pointerAngle = null;
    let proximityT = 0;
    const onPointerMove = (e) => {
      const rect = bar.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);
      // Over the bar itself the light settles on the diagonal (framing the
      // corners) and gently sways with the cursor position within the bar.
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2);
        const ny = (cy - e.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = propsRef.current;

      light.idle += p.speed * dt;
      const steer = p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0);
      const target = steer ? pointerAngle : light.idle;
      const diff = ((target - light.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      light.angle += diff * (1 - Math.exp(-dt * 7));

      // Shine fades in with pointer proximity unless autoAnimate keeps it on
      const brightTarget = p.autoAnimate ? 1 : proximityT;
      light.bright += (brightTarget - light.bright) * (1 - Math.exp(-dt * 8));
      draw();
    };

    if (still) {
      // No sweep, no pointer tracking, no render loop: park the light on the corner
      // diagonal, hold it lit, and repaint only when the bar resizes or its palette
      // changes.
      light.angle = REST_ANGLE;
      light.bright = 1;
      redrawRef.current = draw;
      draw();
    } else {
      window.addEventListener('pointermove', onPointerMove);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      redrawRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (canvas.parentNode === fx) fx.removeChild(canvas);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // frozen picks which of the two paths gets built, so flipping it rebuilds.
  }, [frozen]);

  // A frozen rim repaints nothing on its own, so a prop change (a theme swap
  // recolouring it, say) has to ask for a frame.
  useEffect(() => {
    redrawRef.current?.();
  }, [radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, normalExp]);

  return (
    <div
      ref={barRef}
      className={`specular-bar${canRenderRim() ? '' : ' specular-bar--no-rim'}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-saturate': saturate,
        '--sb-shadow': shadow,
      }}
    >
      <span ref={fxRef} className="specular-bar__fx" aria-hidden="true" />
      <div className="specular-bar__content">{children}</div>
    </div>
  );
}
