// Turns the text of a message into safe HTML.
// Supports ```code blocks```, `inline code`, **bold**, *italic*, _italic_,
// links (http/https) and @mentions.

// Makes text safe to put inside HTML: <b> becomes &lt;b&gt; and shows as text.
export function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Formatting for the parts of a message that are NOT code.
// The input must already be escaped.
function formatText(html) {
  return html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/(^|\s)_(.+?)_(?=\s|$)/g, '$1<em>$2</em>')
    .replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
    .replace(/(^|\s)@(\w+)/g, '$1<span class="mention">@$2</span>');
}

export function renderMarkdown(text) {
  // Split the text into code pieces and normal pieces.
  // The parentheses in the pattern make split() keep the code pieces too.
  const pieces = text.split(/(```[\s\S]*?```|`[^`\n]+`)/);
  let html = '';
  for (const piece of pieces) {
    if (piece.startsWith('```') && piece.length >= 6) {
      const code = piece.slice(3, -3).replace(/^\n/, '');
      html += `<pre><code>${escapeHtml(code)}</code></pre>`;
    } else if (piece.startsWith('`') && piece.length >= 2) {
      html += `<code>${escapeHtml(piece.slice(1, -1))}</code>`;
    } else {
      html += formatText(escapeHtml(piece));
    }
  }
  return html;
}
