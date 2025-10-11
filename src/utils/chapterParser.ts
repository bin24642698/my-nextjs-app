import type { Chapter } from './idb/schema';

/**
 * 解析文本内容，提取章节
 * 支持的章节格式：
 * - 第一章、第二章、第三章...
 * - 第1章、第2章、第3章...
 * - Chapter 1、Chapter 2...
 */
export function parseChapters(content: string): Chapter[] {
  if (!content || content.trim() === '') {
    return [{ id: '1', title: '正文', content: '' }];
  }

  // 章节标题的正则表达式（按优先级排序，更具体的在前面）
  const chapterPatterns = [
    /^第[一二三四五六七八九十百千]+章[^\n]*/gm,  // 中文数字章节
    /^第\d+章[^\n]*/gm,                              // 阿拉伯数字章节
    /^Chapter\s+\d+[^\n]*/gim,                       // 英文章节
  ];

  const matchesMap = new Map<number, string>(); // 使用 Map 去重，key 是位置，value 是标题

  // 查找所有章节标记
  for (const pattern of chapterPatterns) {
    const regex = new RegExp(pattern);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const index = match.index;
      const title = match[0].trim();

      // 如果这个位置还没有匹配结果，或者当前匹配更短（更精确），则保存
      if (!matchesMap.has(index) || title.length < (matchesMap.get(index)?.length || Infinity)) {
        matchesMap.set(index, title);
      }
    }
  }

  // 转换为数组并按位置排序
  const matches = Array.from(matchesMap.entries())
    .map(([index, title]) => ({ index, title }))
    .sort((a, b) => a.index - b.index);

  // 如果没有找到章节标记，返回整个内容作为一章
  if (matches.length === 0) {
    return [{
      id: '1',
      title: '正文',
      content: content
    }];
  }

  const chapters: Chapter[] = [];

  // 提取每个章节的内容
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];

    const startIndex = currentMatch.index;
    const endIndex = nextMatch ? nextMatch.index : content.length;

    const chapterContent = content.substring(startIndex, endIndex).trim();

    chapters.push({
      id: String(i + 1),
      title: currentMatch.title,
      content: chapterContent
    });
  }

  // 如果第一个章节之前还有内容，添加为"序章"
  if (matches[0].index > 0) {
    const prologueContent = content.substring(0, matches[0].index).trim();
    if (prologueContent) {
      chapters.unshift({
        id: '0',
        title: '序章',
        content: prologueContent
      });
    }
  }

  return chapters;
}

/**
 * 将章节内容转换为HTML格式，保持换行
 */
export function contentToHtml(content: string): string {
  if (!content) return '';

  // 将文本按行分割
  const lines = content.split('\n');

  // 转换为HTML段落
  const html = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      return '<p><br></p>'; // 空行
    }
    return `<p>${trimmedLine}</p>`;
  }).join('');

  return html;
}

/**
 * 将HTML转换回纯文本格式
 */
export function htmlToContent(html: string): string {
  if (!html) return '';

  // 移除HTML标签，保留换行
  return html
    .replace(/<p><br><\/p>/g, '\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}
