/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloned sections hotlink original images/CSS; nothing to optimize server-side.
  images: { unoptimized: true },
};

export default nextConfig;
