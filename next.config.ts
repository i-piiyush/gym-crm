import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "nodemailer", "@prisma/client"],
  experimental: {
    optimizePackageImports: ["react-icons", "date-fns", "date-fns-tz"],
  },
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.20.10.7:3000",
    "172.20.10.7",
  ],
};

export default nextConfig;

