import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 содержит нативный модуль. Next не должен его бандлить,
  // иначе он не найдёт .node-файл во время работы.
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    serverActions: {
      // Загрузка PDF в профиле идёт через Server Action. Лимит файла 10 МБ
      // (см. src/features/profile/storage.ts) плюс запас на multipart-обёртку.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
