import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "yt3.ggpht.com",
      "fastly.picsum.photos",
      "images.unsplash.com",
      "i.ytimg.com"
    ],
  },
};

export default withNextIntl(nextConfig);
