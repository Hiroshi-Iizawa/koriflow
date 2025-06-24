import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ["@koriflow/ui", "@koriflow/db"],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@components': join(__dirname, 'components'),
      '@lib': join(__dirname, 'lib'),
      '@app': join(__dirname, 'app'),
    }
    return config
  },
}

export default nextConfig