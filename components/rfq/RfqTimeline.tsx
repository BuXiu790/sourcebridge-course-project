import type { TimelineEvent } from "@/lib/types";

export function RfqTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="mt-5 space-y-0">
      {events.map((event, index) => (
        <li key={event.label} className="relative grid grid-cols-[28px_1fr] gap-3 pb-6 last:pb-0">
          {index < events.length - 1 ? (
            <span
              className={`absolute left-[13px] top-7 h-[calc(100%-12px)] w-px ${
                event.state === "complete" ? "bg-blue-500" : "bg-slate-200"
              }`}
              aria-hidden="true"
            />
          ) : null}
          <span
            className={`relative z-10 mt-0.5 grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-black ${
              event.state === "complete"
                ? "border-blue-600 bg-blue-600 text-white"
                : event.state === "current"
                  ? "border-blue-600 bg-white text-blue-700"
                  : "border-slate-300 bg-white text-slate-400"
            }`}
          >
            {event.state === "complete" ? "✓" : index + 1}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className={`text-sm font-semibold ${event.state === "upcoming" ? "text-slate-500" : "text-slate-950"}`}>
                {event.label}
              </p>
              {event.date ? <span className="text-xs text-slate-500">{event.date}</span> : null}
              {event.state === "current" ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Current</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

