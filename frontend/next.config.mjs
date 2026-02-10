/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable if you need standalone output for Docker etc.
    // output: 'standalone',
    typescript: {
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
