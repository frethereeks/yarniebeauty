type ThreadDividerProps = {
  variant?: "wave" | "loop" | "straight";
  animate?: boolean;
  className?: string;
};

/**
 * The site's signature visual element: a single continuous gold stroke,
 * meant to evoke a length of yarn. Used once per major section break —
 * never stacked or repeated as background decoration.
 */
export function ThreadDivider({ variant = "wave", animate = true, className = "" }: ThreadDividerProps) {
  const paths: Record<string, string> = {
    wave: "M0,12 C 80,2 160,22 240,12 C 320,2 400,22 480,12 C 560,2 640,22 720,12 C 800,2 880,22 960,12 C 1040,2 1120,22 1200,12",
    loop: "M0,12 Q 60,-8 120,12 T 240,12 Q 300,32 360,12 T 480,12 Q 540,-8 600,12 T 720,12 Q 780,32 840,12 T 960,12 Q 1020,-8 1080,12 T 1200,12",
    straight: "M0,12 L1200,12",
  };

  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`thread-divider ${animate ? "thread-draw" : ""} ${className}`}
      aria-hidden="true"
    >
      <path d={paths[variant]} />
    </svg>
  );
}
