const fs = require('fs')
const globby = require('globby')
const matter = require('gray-matter')
const GithubSlugger = require('github-slugger')
const { publicBlogUrl } = require('../lib/public-url')

async function generateSitemap() {
  const files = await globby(['data/blog/**/*.md', 'data/blog/**/*.mdx'])
  const routes = new Set(['', '/about', '/tags'])
  let publishedCount = 0
  for (const file of files.sort()) {
    const { data } = matter(fs.readFileSync(file, 'utf8'))
    if (data.draft === true) continue
    publishedCount += 1
    const route = '/' + file.replace(/^data\/blog\//, '').replace(/\.mdx?$/, '')
    const url = publicBlogUrl(route)
    if (!data.canonicalUrl || publicBlogUrl(data.canonicalUrl) === url) routes.add(route)
    for (const tag of data.tags || []) routes.add('/tags/' + GithubSlugger.slug(tag))
  }
  for (let page = 2; page <= Math.ceil(publishedCount / 5); page += 1) {
    routes.add(`/page/${page}`)
  }
  const escape = (value) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&apos;',
        }[char])
    )
  const urls = [...routes].map(publicBlogUrl)
  fs.writeFileSync(
    'public/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${escape(url)}</loc></url>`)
      .join('\n')}\n</urlset>\n`
  )
  console.log(`Generated blog sitemap with ${urls.length} canonical URLs`)
}

generateSitemap().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
