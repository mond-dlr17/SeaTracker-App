import React from 'react';
import Svg, { Circle, Defs, Filter, FeGaussianBlur, Path, type SvgProps } from 'react-native-svg';

import { Colors } from '../utils/colors';

export function WelcomeCompassSvg({ size = 256, ...props }: { size?: number } & SvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" {...props}>
      <Defs>
        <Filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <FeGaussianBlur stdDeviation={6} />
        </Filter>
        <Filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur stdDeviation={16} />
        </Filter>
      </Defs>

      {/* Glow behind the compass (approximates the blurred accent circle from the design) */}
      <Circle cx="100" cy="100" r="92" fill={Colors.accent} opacity={0.1} filter="url(#glow)" />

      {/* Outer Track Layers */}
      <Circle cx="100" cy="100" r="90" stroke={Colors.primary} strokeWidth="1.5" strokeOpacity={0.08} fill="none" />
      <Circle
        cx="100"
        cy="100"
        r="76"
        stroke={Colors.primary}
        strokeWidth="1.5"
        strokeDasharray="2 6"
        strokeOpacity={0.15}
        fill="none"
      />
      <Circle cx="100" cy="100" r="60" stroke={Colors.primary} strokeWidth="1" strokeOpacity={0.08} fill="none" />
      <Circle cx="100" cy="100" r="54" fill={Colors.primary} fillOpacity={0.03} />

      {/* Compass Directional Indicators */}
      <Path
        d="M100 0 L100 12 M100 188 L100 200 M0 100 L12 100 M188 100 L200 100"
        stroke={Colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity={0.4}
        fill="none"
      />

      {/* Accents on North/East/South/West */}
      <Circle cx="100" cy="20" r="2.5" fill={Colors.accent} />
      <Circle cx="100" cy="180" r="2" fill={Colors.muted} opacity={0.5} />
      <Circle cx="20" cy="100" r="2" fill={Colors.muted} opacity={0.5} />
      <Circle cx="180" cy="100" r="2" fill={Colors.muted} opacity={0.5} />

      {/* Subtle Inner Nav Lines */}
      <Path
        d="M43 43 L52 52 M157 157 L148 148 M157 43 L148 52 M43 157 L52 148"
        stroke={Colors.primary}
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity={0.2}
        fill="none"
      />

      {/* The Needle */}
      {/* Shadow Base */}
      <Path
        d="M100 36 L118 100 L100 164 L82 100 Z"
        fill={Colors.primary}
        fillOpacity={0.08}
        filter="url(#needleShadow)"
      />

      {/* Needle Top (Accent Color) */}
      <Path d="M100 32 L116 100 L84 100 Z" fill={Colors.accent} />
      <Path d="M100 32 L116 100 L100 100 Z" fill={Colors.accent} opacity={0.6} />

      {/* Needle Bottom (Primary/Navy Base) */}
      <Path d="M100 168 L116 100 L84 100 Z" fill={Colors.primary} />
      <Path d="M100 168 L116 100 L100 100 Z" fill={Colors.primary} opacity={0.8} />

      {/* Center Pivot Anchor */}
      <Circle cx="100" cy="100" r="10" fill={Colors.bg} stroke={Colors.primary} strokeWidth="3.5" />
      <Circle cx="100" cy="100" r="3" fill={Colors.accent} />
    </Svg>
  );
}

