import { PUBLIC_IMAGES } from "@/lib/constants/public-images";
import Image from "next/image";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src={PUBLIC_IMAGES.authBackdrop}
          alt=""
          fill
          priority
          className="object-cover opacity-100 saturate-[1.05]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/45 backdrop-blur-[0.5px] dark:bg-background/50 dark:backdrop-blur-none" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-background/40 dark:from-background/35 dark:to-background/55" />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
