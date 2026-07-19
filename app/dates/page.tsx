import type { Metadata } from "next";
import { LightWash } from "@/components/LightWash";
import { Reveal } from "@/components/Reveal";
import { getEvents, type LabelEvent } from "@/lib/content";
import { formatEventDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dates",
  description: "Upcoming and past Ocham Records dates.",
};

// Revalidate hourly: "upcoming" vs "past" is computed from the current time,
// so a fully static page would eventually advertise a show that has happened.
export const revalidate = 3600;

function EventRow({ event, past }: { event: LabelEvent; past?: boolean }) {
  const location = [event.venue, event.city, event.country]
    .filter(Boolean)
    .join(", ");

  return (
    <li
      className={`border-b border-bronze/12 py-7 first:border-t ${
        past ? "opacity-60" : ""
      }`}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,15rem)_1fr_auto] sm:items-baseline sm:gap-8">
        <p className="font-mono text-xs text-dust">
          {formatEventDate(event.startsAt)}
        </p>
        <div>
          <p className="text-lg text-bronze">{event.title}</p>
          {location && <p className="mt-1 text-sm text-dust">{location}</p>}
        </div>
        {event.ticketUrl && !past ? (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="eyebrow whitespace-nowrap transition-colors duration-500 hover:text-copper"
          >
            Tickets →
          </a>
        ) : (
          <span />
        )}
      </div>
    </li>
  );
}

export default async function DatesPage() {
  const { upcoming, past } = await getEvents();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-16 pt-40 sm:px-10">
        <LightWash origin="top-right" />
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow">Live</p>
          <h1 className="display-lg mt-4 text-bronze">Dates</h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10">
        <Reveal>
          <p className="eyebrow">Upcoming</p>
          <div className="mt-5 mb-10">
            {upcoming.length === 0 ? (
              <p className="prose-warm mt-6">
                Nothing announced right now. Check back, or follow along on
                Instagram.
              </p>
            ) : (
              <ul>
                {upcoming.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        {past.length > 0 && (
          <Reveal delay={120}>
            <p className="eyebrow mt-20">Past</p>
            <ul className="mt-5">
              {past.map((event) => (
                <EventRow key={event.id} event={event} past />
              ))}
            </ul>
          </Reveal>
        )}
      </section>
    </main>
  );
}
