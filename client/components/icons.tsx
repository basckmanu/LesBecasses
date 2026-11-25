// Icônes SVG maison (aucune dépendance). Elles prennent la couleur du texte (currentColor).
type P = { size?: number };
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    {children}
  </svg>
);

export const PlayIcon = ({ size = 20 }: P) => svg(size, <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />);
export const PauseIcon = ({ size = 20 }: P) => svg(size, <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />);
export const PrevIcon = ({ size = 20 }: P) => svg(size, <path d="M6 5h2v14H6zM19 5.8v12.4a.8.8 0 0 1-1.24.67L9.3 12.67a.8.8 0 0 1 0-1.34l8.46-5.2A.8.8 0 0 1 19 5.8Z" />);
export const NextIcon = ({ size = 20 }: P) => svg(size, <path d="M16 5h2v14h-2zM5 5.8v12.4a.8.8 0 0 0 1.24.67l8.46-5.2a.8.8 0 0 0 0-1.34L6.24 5.13A.8.8 0 0 0 5 5.8Z" />);

const Arc = ({ flip, label }: { flip?: boolean; label: string }) => (
  <>
    <path
      d="M12 4a8 8 0 1 1-7.75 6h2.08A6 6 0 1 0 12 6v3L7.5 5 12 1v3Z"
      transform={flip ? 'matrix(-1 0 0 1 24 0)' : undefined}
    />
    <text x="12" y="16.2" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="system-ui, sans-serif">
      {label}
    </text>
  </>
);
export const Back15Icon = ({ size = 22 }: P) => svg(size, <Arc label="15" />);
export const Forward30Icon = ({ size = 22 }: P) => svg(size, <Arc flip label="30" />);

export const HeartIcon = ({ size = 18, filled = false }: P & { filled?: boolean }) =>
  svg(
    size,
    <path
      d="M12 20.3 10.6 19C5.6 14.5 2.5 11.7 2.5 8.3A4.8 4.8 0 0 1 7.3 3.5c1.7 0 3.4.8 4.7 2.1a6.5 6.5 0 0 1 4.7-2.1 4.8 4.8 0 0 1 4.8 4.8c0 3.4-3.1 6.2-8.1 10.7Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
    />,
  );

export const VolumeIcon = ({ size = 18, level }: P & { level: number }) =>
  svg(
    size,
    <>
      <path d="M3 9.5v5h3.5l4.5 4V5.5l-4.5 4H3Z" />
      {level > 0 && <path d="M14 8.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
      {level > 0.5 && <path d="M16.5 5.5a8.5 8.5 0 0 1 0 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
      {level === 0 && <path d="m15 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </>,
  );
