import { formatEther } from "viem";

export function shortAddress(address?: string) {
  if (!address) return "not connected";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function bytes32ToText(value?: string) {
  if (!value || value === "0x") return "Unnamed Club";
  try {
    const hex = value.startsWith("0x") ? value.slice(2) : value;
    const bytes = hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0+$/g, "") || "Unnamed Club";
  } catch {
    return "Unnamed Club";
  }
}

export function formatToken(value: bigint | number | undefined, symbol = "REP") {
  if (typeof value === "bigint") return `${Number(formatEther(value)).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
  return `${Number(value ?? 0).toLocaleString()} ${symbol}`;
}

export function formatSeconds(seconds: number) {
  if (seconds <= 0) return "ready";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
