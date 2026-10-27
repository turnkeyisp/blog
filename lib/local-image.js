const fs = require('fs')
const path = require('path')
const sizeOf = require('image-size')

function localImage(url, root = process.cwd()) {
  if (!url.startsWith('/') || url.startsWith('//')) return null
  const pathname = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/blog(?=\/)/, '')
  const publicRoot = path.resolve(root, 'public')
  const filename = path.resolve(publicRoot, `.${pathname}`)
  if (!filename.startsWith(publicRoot + path.sep)) throw new Error(`Invalid image path: ${url}`)
  if (!fs.existsSync(filename)) throw new Error(`Missing local image: ${url}`)
  // JPEG metadata can exceed image-size's bounded file-header read.
  const { width, height } = sizeOf(fs.readFileSync(filename))
  return { src: `/blog${pathname}`, width, height }
}

module.exports = { localImage }
