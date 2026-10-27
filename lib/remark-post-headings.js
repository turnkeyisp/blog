import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

// PostLayout owns the H1. Remove a repeated title and place body headings
// below it while preserving their relative hierarchy.
export default function remarkPostHeadings({ title }) {
  return (tree) => {
    const first = tree.children.findIndex((node) => !['yaml', 'mdxjsEsm'].includes(node.type))
    const heading = tree.children[first]
    if (heading?.type === 'heading' && heading.depth === 1 && toString(heading) === title) {
      tree.children.splice(first, 1)
    }
    let hasH1 = false
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) hasH1 = true
    })
    if (hasH1)
      visit(tree, 'heading', (node) => {
        node.depth = Math.min(6, node.depth + 1)
      })
  }
}
