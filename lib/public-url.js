const siteMetadata = require('../data/siteMetadata')

// Next's router paths omit basePath; content assets sometimes include it.
// Normalize both forms so the public /blog prefix appears exactly once.
function publicBlogUrl(value = '') {
  let pathname = value
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value)
    if (!['turnkeyisp.com', 'turnkeyisp.co'].includes(url.hostname)) return value
    pathname = url.pathname
  }
  pathname = pathname.split(/[?#]/)[0].replace(/^\/blog(?=\/|$)/, '')
  const suffix = pathname.replace(/^\/+|\/+$/g, '')
  return `${siteMetadata.siteUrl}${suffix ? `/${suffix}` : ''}`
}

module.exports = { publicBlogUrl }
