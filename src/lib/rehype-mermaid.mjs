import { visit } from 'unist-util-visit';

export default function rehypeMermaid() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (parent?.tagName === 'pre' && index !== undefined) return;
      if (node.tagName !== 'pre') return;
      const code = node.children?.[0];
      if (code?.tagName !== 'code') return;
      const cls = code.properties?.className;
      if (!Array.isArray(cls) || !cls.includes('language-mermaid')) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['mermaid'] },
        children: code.children,
      };
    });
  };
}
