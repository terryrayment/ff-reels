import Mux from "@mux/mux-node";

let _mux: Mux | null = null;

/**
 * Lazy-initialized Mux client.
 * Throws at runtime (not build time) if env vars are missing.
 */
export function getMux(): Mux {
  if (_mux) return _mux;

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET env vars");
  }

  _mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });

  return _mux;
}
