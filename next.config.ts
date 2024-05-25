import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    config.experiments = {
      ...config.experiments,
      layers: true,
    };
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      canvas: "commonjs canvas",
      "coffee-script": "commonjs coffee-script",
      fs: "commonjs fs",
      async_hooks: "commonjs async_hooks",
      module: "commonjs module",
    });
    return config;
  },
};

export default nextConfig;
