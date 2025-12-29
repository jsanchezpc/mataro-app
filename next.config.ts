import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.google.com https://www.googletagmanager.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://*.googleusercontent.com https://firebasestorage.googleapis.com https://www.google.com https://www.gstatic.com;
              font-src 'self' data: https://fonts.gstatic.com;
              connect-src 'self' https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://region1.google-analytics.com https://firebase.googleapis.com https://content-firebaseappcheck.googleapis.com https://firebasestorage.googleapis.com https://firebaseinstallations.googleapis.com https://mataro-fc521.firebaseapp.com;
              frame-src 'self' https://mataro-app--mataro-fc521.europe-west4.hosted.app https://matarostaging.firebaseapp.com https://mataro-fc521.firebaseapp.com https://www.google.com https://www.google.com/recaptcha/;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          }
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebaseinstallations.googleapis.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
