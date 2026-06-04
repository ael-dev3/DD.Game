import { useEffect, useState } from "react";
import { mockEvents } from "../lib/mockState";

type EventRow = { eventName: string; label?: string; transactionHash?: string };

export function EventFeed() {
  const [events, setEvents] = useState<EventRow[]>(mockEvents);
  useEffect(() => {
    fetch("/generated/game-events.json")
      .then((response) => (response.ok ? response.json() : undefined))
      .then((json) => {
        if (json?.events?.length) setEvents(json.events.slice(-8).reverse());
      })
      .catch(() => undefined);
  }, []);

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
            <span>{event.label || event.transactionHash || "Onchain club event"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
