import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.253.1"],
  serverExternalPackages: ["pdfkit", "exceljs"],
};

export default nextConfig;
