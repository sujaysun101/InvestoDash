/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/test/login",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
