import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      canvas: "commonjs canvas",
      "coffee-script": "commonjs coffee-script",
      "onnxruntime-node": "commonjs onnxruntime-node",
    });
    return config;
  },
};

export default nextConfig;
