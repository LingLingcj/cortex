// Extremely small markdown renderer for demo purposes only.
// Supports: #/##/### headings, paragraphs, fenced code blocks.
// Note: For production use a proper markdown + sanitize stack.
export function miniMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const html: string[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inCode = !inCode;
      html.push(inCode ? '<pre><code>' : '</code></pre>');
      continue;
    }
    if (inCode) {
      html.push(
        line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      );
      continue;
    }
    if (line.startsWith('# ')) html.push(`<h1>${line.slice(2)}</h1>`);
    else if (line.startsWith('## ')) html.push(`<h2>${line.slice(3)}</h2>`);
    else if (line.startsWith('### ')) html.push(`<h3>${line.slice(4)}</h3>`);
    else if (line.trim() === '') html.push('');
    else html.push(`<p>${line}</p>`);
  }
  return html.join('\n');
}

