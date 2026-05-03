import { SiteHeader } from "@/components/site-header";
import { PUBLIC_IMAGES } from "@/lib/constants/public-images";
import Image from "next/image";
import Link from "next/link";

const IMG_STUDENTS =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=640&q=80&auto=format&fit=crop";
const IMG_PLANNING =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=520&q=80&auto=format&fit=crop";

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(56,189,248,0.22),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-soft dark:bg-primary/15" />
      <SiteHeader />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-20 pt-4 sm:px-8">
        <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              CounsellorPro
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Book sessions. Stay aligned. Grow together.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              A calm space for students and counselors to schedule appointments, share meeting links,
              and keep every session on track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="hover-lift inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="hover-lift inline-flex rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="animate-fade-in stagger-2 relative aspect-[4/5] max-h-[420px] sm:aspect-square sm:max-h-[460px]">
              <div className="animate-float absolute right-0 top-0 w-[58%] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <Image
                  src={IMG_STUDENTS}
                  alt="Students collaborating"
                  width={400}
                  height={500}
                  className="h-48 w-full object-cover sm:h-56"
                  priority
                />
              </div>
              <div className="animate-float-slow absolute bottom-[8%] left-0 w-[52%] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <Image
                  src={PUBLIC_IMAGES.landingCalm}
                  alt="Classroom students studying"
                  width={360}
                  height={440}
                  className="h-40 w-full object-cover sm:h-48"
                />
              </div>
              <div className="absolute left-[28%] top-[38%] z-10 w-[44%] overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-2xl ring-4 ring-background">
                <Image
                  src={IMG_PLANNING}
                  alt="Planning and scheduling"
                  width={320}
                  height={280}
                  className="h-32 w-full object-cover sm:h-36"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-in-up stagger-3">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Why teams use CounsellorPro
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Simple booking",
                body: "Students pick open slots; counselors control availability in one place.",
                img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80",
                alt: "Calendar and laptop",
              },
              {
                title: "Built-in meeting links",
                body: "Share a persistent link so every session starts without extra back-and-forth.",
                img: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400&q=80",
                alt: "Video call",
              },
              {
                title: "Feedback that helps",
                body: "Collect session ratings so you can celebrate wins and spot patterns early.",
                img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
                alt: "Supportive conversation",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="hover-lift group overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="animate-fade-in stagger-4 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent/30 p-10 text-center dark:from-card dark:via-card dark:to-primary/10">
          <h2 className="text-2xl font-semibold text-foreground">Ready when you are</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Create an account, choose your role, and open your dashboard in minutes.
          </p>
          <Link
            href="/register"
            className="hover-lift mt-8 inline-flex rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
          >
            Create free account
          </Link>
        </section>
      </main>
    </div>
  );
}
