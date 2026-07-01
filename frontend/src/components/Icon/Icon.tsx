import type { SVGProps } from 'react';

export type IconName =
  | 'book'
  | 'candle'
  | 'hands'
  | 'rosary'
  | 'chalice'
  | 'cross'
  | 'music'
  | 'broadcast'
  | 'heart'
  | 'menu'
  | 'close'
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'mapPin'
  | 'clock'
  | 'calendar'
  | 'image'
  | 'arrowRight'
  | 'chevronLeft'
  | 'chevronRight'
  | 'star'
  | 'users';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, JSX.Element> = {
  book: (
    <path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />
  ),
  candle: (
    <>
      <path d="M12 2c1 1.5 1.5 2.5 0 4-1.5-1.5-1-2.5 0-4z" />
      <rect x="9" y="8" width="6" height="13" rx="1" />
      <path d="M12 8V6" />
    </>
  ),
  hands: (
    <path d="M6 12V7a1.5 1.5 0 0 1 3 0v4m0 0V5a1.5 1.5 0 0 1 3 0v6m0 0V6a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5l-1.5-3a1.5 1.5 0 0 1 2.6-1.5L6 12z" />
  ),
  rosary: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M12 8.5v6" />
      <path d="M10.5 17l1.5 3 1.5-3z" />
      <circle cx="7" cy="9" r="1" />
      <circle cx="17" cy="9" r="1" />
    </>
  ),
  chalice: (
    <>
      <path d="M7 4h10l-1 5a4 4 0 0 1-8 0z" />
      <path d="M12 13v5" />
      <path d="M8 21h8" />
    </>
  ),
  cross: <path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z" />,
  music: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M5 12a7 7 0 0 1 7-7M19 12a7 7 0 0 0-7-7M8 12a4 4 0 0 1 4-4M16 12a4 4 0 0 0-4-4" />
    </>
  ),
  heart: (
    <path d="M12 21s-7-4.6-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3 1.2 4 2.5 1-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 16.4 12 21 12 21z" />
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zm4.5 12.6c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3-1s-3.2-3-3.3-3.2c-.1-.2-.8-1.1-.8-2s.5-1.4.7-1.6c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.5l.7 1.7c.1.2.1.4 0 .5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.2 1.6 1.9 1 .9 1.8 1.1 2 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.2.1.6 0 .9z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </>
  ),
  facebook: (
    <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 0 1 1-1z" />
  ),
  mapPin: (
    <>
      <path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-7 7" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  star: <path d="M12 3l2.4 7.4H22l-6 4.4 2.3 7.2L12 17.6 5.7 22 8 14.8l-6-4.4h7.6z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.4 4 2.3 4 5.8" />
    </>
  ),
};

export function Icon({ name, size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
