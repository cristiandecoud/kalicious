import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Serwist adds a webpack config, but since it's disabled in development,
  // the app runs fine under Turbopack (Next 16 default). This silences the mismatch warning.
  turbopack: {},
};

export default withPWA(nextConfig);
