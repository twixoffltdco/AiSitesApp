/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  // Разрешаем отдавать сгенерированные .txt файлы (IndexNow ключ) как статику из /public
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Content-Type', value: 'application/xml' }]
      }
    ];
  }
};

module.exports = nextConfig;
