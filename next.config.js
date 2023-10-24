/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            
        ],
        formats: ['image/avif', 'image/webp'],
        domains: ['ipfs.thirdwebcdn.com', 'arweave.net', 'nftstorage.link', 'www.arweave.net', 'raw.githubusercontent.com'],
    },
};

module.exports = nextConfig


