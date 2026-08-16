import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Per-domain routing (brentlwilliams.com/eisenhower vs. this app's own
   * domain at root) lives in middleware.ts, not here — basePath applies
   * uniformly to every domain, so it can't express "only under this path
   * on that one domain." */
};

export default nextConfig;
