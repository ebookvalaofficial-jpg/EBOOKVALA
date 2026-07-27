import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'md'; // 'md' | 'pdf' | 'docx'
    const bookId = searchParams.get('bookId');

    // Fetch user highlights, bookmarks, sticky notes
    const whereBook = bookId ? { bookId } : {};

    const [highlights, bookmarks, stickyNotes] = await Promise.all([
      prisma.highlight.findMany({
        where: { userId, ...whereBook },
        include: { book: true, chapter: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookmark.findMany({
        where: { userId, ...whereBook },
        include: { book: true, chapter: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stickyNote.findMany({
        where: { userId, ...(bookId ? { bookId } : {}) },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const title = 'EbookVala Reading Notes & Highlights Export';
    const dateStr = new Date().toLocaleDateString();

    if (format === 'md') {
      let content = `# ${title}\n*Exported on: ${dateStr}*\n\n`;

      content += `## 📚 Highlights & Annotations (${highlights.length})\n\n`;
      highlights.forEach((h, i) => {
        content += `### ${i + 1}. ${h.book.title} — ${h.chapter.title}\n`;
        content += `> "${h.selectedText}"\n\n`;
        if (h.note) content += `*Note:* ${h.note}\n\n`;
        content += `*Color:* ${h.color} | *Visibility:* ${h.isPublic ? 'Public' : 'Private'} | *Date:* ${new Date(h.createdAt).toLocaleDateString()}\n\n---\n\n`;
      });

      content += `## 🔖 Bookmarks (${bookmarks.length})\n\n`;
      bookmarks.forEach((b, i) => {
        content += `${i + 1}. **${b.book.title}** - Chapter: *${b.chapter.title}* (${b.scrollPositionPercent.toFixed(0)}% read) - ${b.label || 'Bookmark'}\n`;
      });

      content += `\n## 📝 Sticky Notes (${stickyNotes.length})\n\n`;
      stickyNotes.forEach((s, i) => {
        content += `### ${i + 1}. ${s.title || 'Untitled Note'} ${s.book ? `(${s.book.title})` : ''}\n`;
        content += `${s.content}\n\n`;
      });

      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="EbookVala_Notes_Export_${new Date().toISOString().split('T')[0]}.md"`,
        },
      });
    } else if (format === 'docx' || format === 'doc') {
      // HTML formatted document that Word opens natively as DOCX
      let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>${title}</title><style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
          h1 { color: #2563eb; font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #4f46e5; font-size: 18px; margin-top: 20px; }
          blockquote { background: #f1f5f9; border-left: 4px solid #2563eb; margin: 10px 0; padding: 10px 15px; font-style: italic; }
          .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
        </style></head>
        <body>
          <h1>${title}</h1>
          <p class="meta">Exported on: ${dateStr}</p>

          <h2>Highlights & Annotations (${highlights.length})</h2>
      `;

      highlights.forEach((h, i) => {
        html += `
          <div>
            <h3>${i + 1}. ${h.book.title} — ${h.chapter.title}</h3>
            <blockquote>"${h.selectedText}"</blockquote>
            ${h.note ? `<p><strong>Note:</strong> ${h.note}</p>` : ''}
            <p class="meta">Color: ${h.color} | Visibility: ${h.isPublic ? 'Public' : 'Private'} | ${new Date(h.createdAt).toLocaleDateString()}</p>
          </div>
          <hr/>
        `;
      });

      html += `<h2>Bookmarks (${bookmarks.length})</h2><ul>`;
      bookmarks.forEach((b) => {
        html += `<li><strong>${b.book.title}</strong> — ${b.chapter.title} (${b.scrollPositionPercent.toFixed(0)}%)</li>`;
      });
      html += `</ul>`;

      html += `<h2>Sticky Notes (${stickyNotes.length})</h2>`;
      stickyNotes.forEach((s) => {
        html += `<div><h3>${s.title || 'Note'}</h3><p>${s.content}</p></div>`;
      });

      html += `</body></html>`;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'application/msword; charset=utf-8',
          'Content-Disposition': `attachment; filename="EbookVala_Notes_Export_${new Date().toISOString().split('T')[0]}.doc"`,
        },
      });
    } else {
      // PDF Printable HTML format
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #2563eb; font-size: 26px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
            h2 { color: #4f46e5; font-size: 20px; margin-top: 30px; }
            blockquote { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; font-style: italic; }
            .item { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
            .meta { font-size: 12px; color: #64748b; font-weight: 600; }
            @media print { body { padding: 0; } button { display: none; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="position:fixed;top:20px;right:20px;padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Print / Save as PDF</button>
          <h1>${title}</h1>
          <p class="meta">Exported on: ${dateStr}</p>

          <h2>📚 Highlights & Annotations (${highlights.length})</h2>
      `;

      highlights.forEach((h, i) => {
        html += `
          <div class="item">
            <h3 style="margin:0 0 6px 0;font-size:16px;">${i + 1}. ${h.book.title} <span style="font-weight:normal;color:#64748b;">(${h.chapter.title})</span></h3>
            <blockquote>"${h.selectedText}"</blockquote>
            ${h.note ? `<p style="margin:4px 0;"><strong>Note:</strong> ${h.note}</p>` : ''}
            <div class="meta">Color: ${h.color} • ${h.isPublic ? 'Public Note' : 'Private'} • ${new Date(h.createdAt).toLocaleDateString()}</div>
          </div>
        `;
      });

      html += `<h2>🔖 Bookmarks (${bookmarks.length})</h2><ul>`;
      bookmarks.forEach((b) => {
        html += `<li><strong>${b.book.title}</strong> — ${b.chapter.title} (${b.scrollPositionPercent.toFixed(0)}%)</li>`;
      });
      html += `</ul>`;

      html += `<h2>📝 Sticky Notes (${stickyNotes.length})</h2>`;
      stickyNotes.forEach((s) => {
        html += `<div class="item"><h3>${s.title || 'Untitled Note'}</h3><p>${s.content}</p></div>`;
      });

      html += `
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
        </body></html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  } catch (error) {
    console.error('[NOTES EXPORT API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to export notes' }, { status: 500 });
  }
}
