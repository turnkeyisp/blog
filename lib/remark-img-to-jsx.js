import { visit } from 'unist-util-visit'
import { localImage } from './local-image'

export default function remarkImgToJsx() {
  return (tree) => {
    let firstImage = true
    visit(tree, 'image', (node) => {
      const image = localImage(node.url)
      if (!image) return
      const priority = firstImage
      firstImage = false
      // A phrasing component keeps surrounding links, captions and text intact.
      node.type = 'mdxJsxTextElement'
      node.name = 'Image'
      node.attributes = [
        { type: 'mdxJsxAttribute', name: 'alt', value: node.alt || '' },
        ...Object.entries(image).map(([name, value]) => ({
          type: 'mdxJsxAttribute',
          name,
          value: String(value),
        })),
        { type: 'mdxJsxAttribute', name: 'layout', value: 'responsive' },
        { type: 'mdxJsxAttribute', name: 'sizes', value: '(min-width: 1280px) 768px, 100vw' },
        {
          type: 'mdxJsxAttribute',
          name: priority ? 'priority' : 'loading',
          value: priority ? null : 'lazy',
        },
      ]
      node.children = []
    })
  }
}
