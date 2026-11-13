/**
 * Layout primitives for the fixed 1920×1080 artboard.
 * Every coordinate is the Figma frame coordinate (px), so components read like the design file.
 */
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Pos = { x: number; y: number; w?: number; h?: number };
type Interactive = { to?: string; onClick?: MouseEventHandler; label?: string };
type Base = Pos & Interactive & { className?: string; style?: CSSProperties; children?: ReactNode; id?: string };

const px = (v?: number) => (v === undefined ? undefined : `${v}px`);

function posStyle({ x, y, w, h }: Pos): CSSProperties {
  return { left: px(x), top: px(y), width: px(w), height: px(h) };
}

/** Renders as <Link> when `to` is set, <button> when `onClick` is set, otherwise as `tag`. */
function El({ to, onClick, label, className, style, children, tag = 'div', id }: Interactive & {
  className?: string; style?: CSSProperties; children?: ReactNode; tag?: 'div' | 'p'; id?: string;
}) {
  if (to) return <Link to={to} className={className} style={style} aria-label={label} onClick={onClick} id={id}>{children}</Link>;
  if (onClick) return <button type="button" className={className} style={{ ...style, textAlign: style?.textAlign ?? 'left' }} aria-label={label} onClick={onClick} id={id}>{children}</button>;
  const Tag = tag;
  return <Tag className={className} style={style} id={id}>{children}</Tag>;
}

/** Absolutely positioned box (solid rectangles, borders, hit areas). */
export function Box({ x, y, w, h, bg, border, borderColor = 'var(--paper)', className = '', style, ...rest }: Base & {
  bg?: string; border?: number; borderColor?: string;
}) {
  const s: CSSProperties = { ...posStyle({ x, y, w, h }), background: bg, ...style };
  // Figma INSIDE stroke → inset shadow (renders sub-pixel widths like Figma; CSS borders snap to 1px)
  if (border) s.boxShadow = `inset 0 0 0 ${border}px ${borderColor}`;
  return <El {...rest} className={`abs ${rest.to || rest.onClick ? 'hit ' : ''}${className}`} style={s} />;
}

export type TxtProps = Base & {
  size?: number; lh?: number | 'none'; color?: string; weight?: 400 | 600;
  align?: 'left' | 'center' | 'right'; underline?: boolean; nowrap?: boolean;
  /** x is the horizontal center (Figma "-translate-x-1/2") */
  center?: boolean; shadow?: string;
};

/** Text layer. `lh` is the Figma line height as a multiple (1.5 = 150%). Letter spacing is -2% globally. */
export function Txt({ x, y, w, h, size = 13, lh = 1.6, color = 'var(--white)', weight = 600, align, underline, nowrap,
  center, shadow, className = '', style, children, ...rest }: TxtProps) {
  const s: CSSProperties = {
    ...posStyle({ x, y, w, h }), fontSize: px(size), lineHeight: lh === 'none' ? 1 : lh, color, fontWeight: weight,
    textAlign: align, textShadow: shadow, ...style,
  };
  if (center) s.transform = `translateX(-50%)${style?.transform ? ' ' + style.transform : ''}`;
  const cls = `txt${underline ? ' u' : ''}${nowrap ? ' nowrap' : ''} ${className}`;
  return <El {...rest} tag="p" className={cls} style={s}>{children}</El>;
}

/** Inline style run inside a Txt (mixed weights/colours/sizes). */
export function Run({ children, ...s }: CSSProperties & { children: ReactNode }) {
  return <span style={s}>{children}</span>;
}

export type Crop = { w: number; h: number; l: number; t: number }; // percentages, as Figma's crop transform

/** Converts a Figma CROP imageTransform [[a,0,tx],[0,d,ty]] into CSS percentages. */
export function cropOf(a: number, tx: number, d: number, ty: number): Crop {
  return { w: 100 / a, h: 100 / d, l: (-tx / a) * 100, t: (-ty / d) * 100 };
}

/**
 * Raster image layer — always the downloaded Figma image, never redrawn.
 * fit: Figma FILL → object-fit cover. crop: Figma CROP → explicit percentages.
 */
export function Pic({ src, x, y, w, h, crop, fit = 'cover', position, gray, opacity, rotate, border, borderColor = 'var(--paper)',
  className = '', style, imgStyle, alt = '', ...rest }: Base & {
  src: string; crop?: Crop; fit?: 'cover' | 'contain' | 'fill'; position?: string; gray?: boolean; opacity?: number;
  rotate?: number; border?: number; borderColor?: string; imgStyle?: CSSProperties; alt?: string;
}) {
  const s: CSSProperties = { ...posStyle({ x, y, w, h }), ...style };
  if (rotate) { s.transform = `rotate(${rotate}deg)`; s.transformOrigin = '0 0'; }
  if (border) Object.assign(s, { '--sw': `${border}px`, '--sc': borderColor });
  const filter = gray ? 'grayscale(1)' : undefined;
  const img: CSSProperties = crop
    ? { width: `${crop.w}%`, height: `${crop.h}%`, left: `${crop.l}%`, top: `${crop.t}%`, opacity, filter, ...imgStyle }
    : { objectFit: fit, objectPosition: position, opacity, filter, ...imgStyle };
  return (
    <El {...rest} className={`pic${crop ? '' : ' fit'}${border ? ' stroked' : ''}${rest.to || rest.onClick ? ' hit' : ''} ${className}`} style={s}>
      <img src={src} alt={alt} style={img} draggable={false} decoding="async" />
    </El>
  );
}

/** Vector layer exported from Figma as SVG (lines, circles, logo, icons). */
export function Svg({ src, x, y, w, h, rotate, flipX, className = '', style, ...rest }: Base & {
  src: string; w: number; h: number; rotate?: number; flipX?: boolean;
}) {
  const t = [rotate ? `rotate(${rotate}deg)` : '', flipX ? 'scaleX(-1)' : ''].join(' ').trim();
  return (
    <El {...rest} className={`svg${rest.to || rest.onClick ? ' hit' : ''} ${className}`}
      style={{ ...posStyle({ x, y, w, h }), transform: t || undefined, pointerEvents: rest.to || rest.onClick ? 'auto' : 'none', ...style }}>
      <img src={src} alt="" draggable={false} />
    </El>
  );
}

/**
 * Figma LINE layers (0.5px strokes). Drawn as one translucent pixel row/column so they rasterise
 * like Figma's own render (a 0.5px stroke covering half a pixel), at any stage scale.
 * Default: the stroke lies just above `y` ([y-0.5, y]); `center`: centred on `y`.
 */
export function HLine({ x, y, len, color = 'var(--white)', center, className, style }: {
  x: number; y: number; len: number; color?: string; center?: boolean; className?: string; style?: CSSProperties;
}) {
  const s: CSSProperties = center
    ? { left: px(x), top: px(y - 1), width: px(len), height: '2px', opacity: 0.25 }
    : { left: px(x), top: px(Math.floor(y - 0.5)), width: px(len), height: '1px', opacity: 0.5 };
  return <div className={`abs line ${className ?? ''}`} style={{ ...s, background: color, ...style }} />;
}

/** Vertical Figma LINE from (x, y) downwards. dir -90: stroke left of x, 90: right of x (as Figma renders them). */
export function VLine({ x, y, len, color = 'var(--white)', dir = -90, center, className, style }: {
  x: number; y: number; len: number; color?: string; dir?: 90 | -90; center?: boolean; className?: string; style?: CSSProperties;
}) {
  const s: CSSProperties = center
    ? { left: px(x - 1), top: px(y), width: '2px', height: px(len), opacity: 0.25 }
    : { left: px(dir === -90 ? Math.floor(x - 0.5) : Math.floor(x)), top: px(y), width: '1px', height: px(len), opacity: 0.5 };
  return <div className={`abs line ${className ?? ''}`} style={{ ...s, background: color, ...style }} />;
}
