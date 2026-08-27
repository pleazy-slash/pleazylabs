/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable persistent filesystem caching to prevent Termux dependency snapshot errors
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
