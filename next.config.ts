/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Deshabilitar API routes para exportación estática
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
