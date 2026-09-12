import { type FC, useId } from 'react';
import { useTheme } from '../theme/useTheme';

// Material "local offer" price-tag glyph (24x24 coordinate space).
const TAG_PATH =
  'm21.41 11.58-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7';

interface LogoProps {
  size?: number;
  /** Render just the glyph, without the rounded tile. */
  bare?: boolean;
}

const Logo: FC<LogoProps> = ({ size = 28, bare = false }) => {
  const { t } = useTheme();
  const uid = useId().replace(/:/g, '');
  const sheenId = `pp-sheen-${uid}`;
  const shadeId = `pp-shade-${uid}`;
  // Themes come in light/dark pairs: light themes use deep accents (white glyph),
  // dark themes use bright accents (black glyph). Keeps the mark legible everywhere.
  const glyph = bare ? t.accent : t.isDark ? '#111111' : '#ffffff';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="ProductPromo"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
        </linearGradient>
      </defs>

      {!bare && (
        <>
          <rect width="32" height="32" rx="8" fill={t.accent} />
          <rect width="32" height="32" rx="8" fill={`url(#${sheenId})`} />
          <rect width="32" height="32" rx="8" fill={`url(#${shadeId})`} />
        </>
      )}

      <g fill={glyph}>
        <g transform="translate(3 5) scale(0.78)">
          <path d={TAG_PATH} />
        </g>
        <path d="M24.5 3.5Q24.5 7.5 28.5 7.5Q24.5 7.5 24.5 11.5Q24.5 7.5 20.5 7.5Q24.5 7.5 24.5 3.5Z" />
      </g>
    </svg>
  );
};

export default Logo;
