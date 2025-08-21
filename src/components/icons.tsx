import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      className={cn(props.className)}
      {...props}
    >
      <defs>
        <filter id="handwriting" x="-20" y="-20" width="200" height="200">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.05"
            numOctaves="3"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="38"
        fontFamily="'Caveat', cursive"
        fill="currentColor"
        style={{ filter: 'url(#handwriting)' }}
      >
        ArtVaani
      </text>
    </svg>
  );
}
