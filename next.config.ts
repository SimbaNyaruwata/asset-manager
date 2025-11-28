import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["your-supabase-project.supabase.co"], // 👈 Add Supabase domain here
  },
};

export default nextConfig;
