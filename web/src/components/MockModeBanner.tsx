export function MockModeBanner({ enabled, reason }: { enabled: boolean; reason?: string }) {
  if (!enabled) return null;
  return (
    <div className="mock-banner">
      <strong>Mock review mode</strong>
      <span>{reason || "No deployed club was found, so the UI is using local sample data. Wallet writes require Base Sepolia contract addresses."}</span>
    </div>
  );
}
