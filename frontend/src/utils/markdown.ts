// Enhanced markdown renderer for better blog experience
// Supports: headings, paragraphs, code blocks, inline code, links, images, lists, bold, italic, blockquotes
export function miniMarkdown(md: string): string {
  if (!md) return '';

  // Process code blocks first to avoid interference
  let html = md;

  // Handle code blocks with language info
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : '';
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code${langClass}>${escapedCode}</code></pre>`;
  });

  // Split into lines for block-level processing
  const lines = html.split(/\r?\n/);
  const result: string[] = [];
  let inBlockquote = false;
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle headings
    if (trimmed.startsWith('# ')) {
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      result.push(`<h1>${processInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      result.push(`<h2>${processInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      result.push(`<h3>${processInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('#### ')) {
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      result.push(`<h4>${processInline(trimmed.slice(5))}</h4>`);
    } else if (trimmed.startsWith('>')) {
      // Handle blockquotes
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      if (!inBlockquote) {
        result.push('<blockquote>');
        inBlockquote = true;
      }
      result.push(`<p>${processInline(trimmed.slice(1).trim())}</p>`);
    } else if (/^[*-]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      // Handle lists
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }

      const isOrdered = /^\d+\.\s/.test(trimmed);
      const currentListType = isOrdered ? 'ol' : 'ul';

      if (!inList || listType !== currentListType) {
        if (inList) result.push(`</${listType}>`);
        result.push(`<${currentListType}>`);
        inList = true;
        listType = currentListType;
      }

      const content = processInline(trimmed.replace(/^[*-]\s|\d+\.\s/, ''));
      result.push(`<li>${content}</li>`);
    } else if (trimmed === '') {
      // Empty lines - close block elements
      if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
      if (inList) { result.push(`</${listType}>`); inList = false; listType = ''; }
      result.push('');
    } else {
      // Regular paragraph
      if (inBlockquote) {
        result.push(`<p>${processInline(trimmed)}</p>`);
      } else if (inList) {
        result.push(`</${listType}>`);
        result.push(`<p>${processInline(trimmed)}</p>`);
        inList = false;
        listType = '';
      } else {
        result.push(`<p>${processInline(trimmed)}</p>`);
      }
    }
  }

  // Close any remaining block elements
  if (inBlockquote) result.push('</blockquote>');
  if (inList) result.push(`</${listType}>`);

  return result.join('\n').replace(/\n+/g, '\n');
}

// Process inline markdown elements
function processInline(text: string): string {
  // Process inline code first to avoid conflicts
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');

  // Process bold **text** or __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Process italic *text* or _text_
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Process strikethrough ~~text~~
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Handle line breaks
  text = text.replace(/\n/g, '<br>');

  return text;
}

