import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()

  return (
    <div className="nextra-docs-container">
      <Head />
      <Layout
        navbar={
          <Navbar
            logo={
              <span className="font-bold text-lg">
                🚀 ClaudeShip
              </span>
            }
            projectLink="https://github.com/nicered/claudeship"
          />
        }
        pageMap={pageMap}
        docsRepositoryBase="https://github.com/nicered/claudeship/tree/main/docs"
        footer={<Footer>MIT {new Date().getFullYear()} © ClaudeShip</Footer>}
        editLink="Edit this page"
        feedback={{ content: 'Question? Give us feedback →' }}
        sidebar={{ defaultMenuCollapseLevel: 1 }}
        toc={{ backToTop: 'Scroll to top' }}
      >
        {children}
      </Layout>
    </div>
  )
}
