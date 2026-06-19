import { Fragment, ReactNode } from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

type Block =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

const inlinePattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(inlinePattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: Math.max(2, heading[1].length) as 2 | 3 | 4, text: heading[2] });
      continue;
    }

    const unorderedItem = /^[-*]\s+(.+)$/.exec(line);
    const orderedItem = /^\d+[.)]\s+(.+)$/.exec(line);
    const item = unorderedItem?.[1] ?? orderedItem?.[1];
    if (item) {
      flushParagraph();
      const ordered = Boolean(orderedItem);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
  const blocks = parseMarkdown(text);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = `h${block.level}` as const;
          return <HeadingTag key={index}>{renderInline(block.text)}</HeadingTag>;
        }
        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ListTag>
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
