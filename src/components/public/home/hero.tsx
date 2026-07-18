import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-ink overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center min-h-[88vh] lg:min-h-[92vh] py-16">
        {/* Editorial type block */}
        <div className="order-2 lg:order-1 relative z-10">
          <p className="text-eyebrow text-gold-bright mb-6">Handmade · Heirloom-grade</p>
          <h1 className="text-display-xl text-cream mb-7">
            Every piece
            <br />
            starts as
            <br />
            <span className="italic text-gold-bright">one thread.</span>
          </h1>
          <p className="text-cream/75 text-base sm:text-lg leading-relaxed max-w-md mb-9 font-body">
            Yarniebeauty hand-finishes yarn and crochets pieces to order — and
            teaches the stitches behind them, through cohorts you can join
            from anywhere.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center px-7 py-3.5 bg-gold text-ink text-eyebrow font-semibold hover:bg-gold-bright transition-colors"
            >
              Shop the collection
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center px-7 py-3.5 border border-cream/30 text-cream text-eyebrow hover:border-gold-bright hover:text-gold-bright transition-colors"
            >
              Join the academy
            </Link>
          </div>
        </div>

        {/* Signature visual: the thread becoming a stitch */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center">
          <ThreadToStitch />
        </div>
      </div>
    </section>
  );
}

/**
 * The hero's signature moment: a single gold line draws in, then loops into
 * a simple crochet chain-stitch silhouette. This is the one bold visual risk
 * — everything else on the page stays quiet around it.
 */
function ThreadToStitch() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="w-full max-w-md h-auto"
      role="img"
      aria-label="A single gold thread forming a chain of crochet stitches"
    >
      <path
        d="M 40 240
           C 40 150, 110 90, 170 110
           C 215 125, 200 180, 160 185
           C 120 190, 110 145, 150 140
           C 200 133, 230 175, 220 220
           C 210 270, 150 280, 150 240
           C 150 205, 195 200, 210 235
           C 230 280, 290 290, 320 250
           C 345 217, 320 175, 285 185
           C 255 193, 260 230, 295 230
           C 340 230, 380 195, 410 150"
        fill="none"
        stroke="#C9A227"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: "thread-draw-hero 2.6s cubic-bezier(0.65,0,0.35,1) forwards",
        }}
      />
      <style>{`
        @keyframes thread-draw-hero {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </svg>
  );
}
