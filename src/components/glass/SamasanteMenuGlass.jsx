import { Glass } from "@samasante/liquid-glass";

// Subtle, legible optics tuned for a ~44px nav bar over a dark-or-light
// live WebGL backdrop. See verified spec for rationale on each value.
const GLASS_MENU_OPTICS = {
  strength: 0.12, // gentle refraction (max pixel move, small bar -> keep light)
  depth: 0.4, // bend reaches modestly inward; also gates curvature
  curvature: 0.06, // near-flat centre, NOT a magnifier dome
  dispersion: 0.18, // a hint of chromatic colour split at the rim
  bend: 0.12, // subtle "liquid lip" at the edge
  bendWidth: 0.16, // thin meniscus
  frost: 4, // soft frosted blur of the backdrop
  brightness: 0.04, // whisper of brightening veil (positive = white)
  sheen: 0.35, // soft directional edge highlight
  sheenWidth: 8, // thin sheen band (px)
  sheenFalloff: 1.6,
  sheenAngle: 120, // light pools upper-left-ish (degrees, 0 = left)
  specular: 0.5, // moderate overall highlight gain
  glow: 0.12, // faint inner glow
  glowSpread: 0.18,
  glowFalloff: 2,
  splay: 0,
};

// The wrapped element IS the sized box: children supply intrinsic width,
// height is pinned to 44, and the lens inherits the 14px border-radius.
const GLASS_MENU_STYLE = {
  height: 44,
  padding: "0 20px",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  border: "1px solid var(--glass-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--fg)",
};

/**
 * SamasanteMenuGlass
 *
 * Glass-wrapped menu container that visually replaces the old
 * <GlassSurface width="auto" height={44}> at the same DOM position. The
 * <nav className="menu-bar"> stays in App.jsx and wraps this component.
 *
 * Props:
 *   - children:  the .menu-content node (gives the lens its intrinsic width)
 *   - className: passed straight through to the rendered <div>
 *
 * Theme adaptation is automatic: --fg and --glass-border are CSS vars on
 * .app, so dark/light switching needs no JS branch. Self-contained and safe
 * to mount/unmount repeatedly (the picker remounts on switch).
 */
export default function SamasanteMenuGlass({ children, className }) {
  return (
    <Glass className={className} style={GLASS_MENU_STYLE} optics={GLASS_MENU_OPTICS}>
      {children}
    </Glass>
  );
}
