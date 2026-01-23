import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs',
  defaultShowCopyCode: true,
})

const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/ClaudeShip' : ''

export default withNextra({
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: isProd ? '/ClaudeShip/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
})
