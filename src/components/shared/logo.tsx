import Image from "next/image";

type LogoProps = {
  variant?: "icon" | "full";
  size?: number;
  className?: string;
};

// The icon asset (logo-icon.png) was cropped from the full square logo at
// 830x590px — not square — so we preserve that aspect ratio rather than
// forcing it into a square box, which previously clipped the mark or left
// dead space depending on crop direction.
const ICON_ASPECT = 590 / 830;

/**
 * The Yarniebeauty logo. `full` renders the original square lockup (icon +
 * wordmark + tagline) for spots with vertical room, like the footer.
 * `icon` renders a pre-cropped version of just the icon mark (basket +
 * yarn + crochet hook) for compact spots like navbars and sidebar headers,
 * sized by height with width following its natural aspect ratio. Both
 * assets have a solid black background — only ever place this on dark
 * (bg-ink) surfaces, which is true everywhere it's currently used.
 */
export function Logo({ variant = "icon", size = 40, className = "" }: LogoProps) {
  if (variant === "full") {
    return (
      <Image
        src="/brand/logo.png"
        alt="Yarniebeauty & Crochet"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  const width = Math.round(size / ICON_ASPECT);

  return (
    <Image
      src="/brand/logo-icon.png"
      alt="Yarniebeauty"
      width={width}
      height={size}
      className={className}
      priority
    />
  );
}
