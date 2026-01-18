/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const server = process.env.SERVER_URL;

    const apiProxy = {
      source: "/api/:path*",
      destination: `${server}/:path*`,
    }

    console.log(`🌐 API Proxy Active forwarding traffic:\n - from\t${apiProxy.source}\n - to\t${apiProxy.destination}`)

    return [
      apiProxy
    ]
  }
};

export default nextConfig;
