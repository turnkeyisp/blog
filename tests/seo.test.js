const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { publicBlogUrl } = require('../lib/public-url')

test('public URLs normalize base paths, legacy domains and query strings', () => {
  const cases = [
    ['', 'https://turnkeyisp.com/blog'],
    ['/', 'https://turnkeyisp.com/blog'],
    [
      '/inbound-sales-call-training?utm_source=test#question',
      'https://turnkeyisp.com/blog/inbound-sales-call-training',
    ],
    [
      '/blog/inbound-sales-call-training',
      'https://turnkeyisp.com/blog/inbound-sales-call-training',
    ],
    [
      '/blog/static/images/twitter-card.png',
      'https://turnkeyisp.com/blog/static/images/twitter-card.png',
    ],
    ['/static/images/logo.png', 'https://turnkeyisp.com/blog/static/images/logo.png'],
    ['https://turnkeyisp.co/blog/about', 'https://turnkeyisp.com/blog/about'],
    ['https://example.com/image.png?width=100', 'https://example.com/image.png?width=100'],
    ['/page/2', 'https://turnkeyisp.com/blog/page/2'],
  ]
  for (const [input, expected] of cases) assert.equal(publicBlogUrl(input), expected, input)
})

test('sitemap lists published routes and tags, excludes drafts and route templates', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'turnkey-seo-'))
  try {
    fs.mkdirSync(path.join(directory, 'data/blog/nested'), { recursive: true })
    fs.mkdirSync(path.join(directory, 'public'))
    fs.writeFileSync(
      path.join(directory, 'data/blog/published.md'),
      '---\ntitle: Published\ndraft: false\ntags: [Call Center]\n---\nBody'
    )
    fs.writeFileSync(
      path.join(directory, 'data/blog/draft.md'),
      '---\ntitle: Draft\ndraft: true\ntags: [Private]\n---\nBody'
    )
    fs.writeFileSync(
      path.join(directory, 'data/blog/nested/post.mdx'),
      '---\ntitle: Nested\n---\nBody'
    )
    fs.writeFileSync(
      path.join(directory, 'data/blog/syndicated.md'),
      '---\ntitle: Syndicated\ncanonicalUrl: https://example.com/original\n---\nBody'
    )
    for (let index = 0; index < 3; index += 1) {
      fs.writeFileSync(
        path.join(directory, `data/blog/extra-${index}.md`),
        '---\ntitle: Extra\n---\nBody'
      )
    }
    execFileSync(process.execPath, [path.resolve(__dirname, '../scripts/generate-sitemap.js')], {
      cwd: directory,
    })
    const xml = fs.readFileSync(path.join(directory, 'public/sitemap.xml'), 'utf8')
    assert.match(xml, /<loc>https:\/\/turnkeyisp.com\/blog\/published<\/loc>/)
    assert.match(xml, /<loc>https:\/\/turnkeyisp.com\/blog\/nested\/post<\/loc>/)
    assert.match(xml, /<loc>https:\/\/turnkeyisp.com\/blog\/tags\/call-center<\/loc>/)
    assert.match(xml, /<loc>https:\/\/turnkeyisp.com\/blog\/page\/2<\/loc>/)
    assert.doesNotMatch(xml, /\/draft|\/private|\/syndicated|\[|blog\/blog|turnkeyisp\.co\//)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
