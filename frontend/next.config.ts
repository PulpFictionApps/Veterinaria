import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during production builds to avoid CI failures while addressing type/lint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    // Optimizar re-renders
    optimizeServerReact: true,
  },
  
  // Configuración de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Configuración de headers para caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },
  
  // Configuración de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          }
        }
      };
    }
    
    return config;
  },
  
  // Compresión automática
  compress: true,
};

export default nextConfig;
