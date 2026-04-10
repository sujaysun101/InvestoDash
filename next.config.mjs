/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // officeparser pulls file-type with package exports that webpack mishandles
    serverComponentsExternalPackages: ["officeparser", "file-type"],
  },
};

export default nextConfig;
