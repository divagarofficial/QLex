/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: [
    "192.168.27.188",
    "localhost",
    "192.168.244.18"
  ],
};

export default nextConfig;
