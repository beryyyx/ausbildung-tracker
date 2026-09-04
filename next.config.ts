import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 содержит нативный модуль. Next не должен его бандлить,
  // иначе он не найдёт .node-файл во время работы.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
