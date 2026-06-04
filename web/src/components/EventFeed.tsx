import { mockEvents } from "../lib/mockState";

type EventRow = { eventName: string; label: string };

export function EventFeed() {
  const events: EventRow[] = mockEvents;

  return (
    <section className="panel">
      <div className="section-title">
        <p className="eyebrow">Event feed</p>
        <h2>Recent club moves</h2>
      </div>
      <ul className="event-feed">
        {events.map((event, index) => (
          <li key={`${event.eventName}-${index}`}>
            <strong>{event.eventName}</strong>
            <span>{event.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
