import Image from "next/image";

type AsideProps = {
  /** Short label above the image */
  label: string;
  imageSrc: string;
  imageAlt: string;
};

/**
 * Decorative strip for dashboards: image + subtle motion on hover.
 */
export function DashboardHeroAside({ label, imageSrc, imageAlt }: AsideProps) {
  return (
    <aside className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-accent/40 p-1 dark:to-primary/5">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[0.9rem] sm:aspect-[2/1]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <p className="absolute bottom-3 left-3 right-3 text-xs font-medium uppercase tracking-wider text-foreground/90 drop-shadow-sm">
          {label}
        </p>
      </div>
    </aside>
  );
}
