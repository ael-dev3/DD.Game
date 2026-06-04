const pressureCards = [
  {
    title: "Choose a target resource",
    copy: "Rival clubs threaten one resource lane at a time, forcing the player to decide what matters most this night."
  },
  {
    title: "Set a guard priority",
    copy: "Protect BONES, HYPE, VIBE, or SECURITY before the room gets too loud. Good reads prevent losses."
  },
  {
    title: "Heat changes behavior",
    copy: "Higher Club Heat makes rival pressure more likely, so fast growth has a visible downside."
  }
];

export function RaidPanel() {
  return (
    <section className="panel raid-panel">
      <div className="section-title">
        <p className="eyebrow">Rival clubs</p>
        <h2>Guard the Back Room</h2>
      </div>
      <p>Rival pressure stays as a design concept in this static draft. There is no player targeting, live raid action, or connected backend.</p>
      <div className="action-grid">
        {pressureCards.map((card) => (
          <article className="action-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
            <span className="draft-note">Draft system note</span>
          </article>
        ))}
      </div>
    </section>
  );
}
