import React from 'react';

/**
 * Lightweight markdown renderer for AI chat messages.
 * Supports: **bold**, *italic*, `code`, headers (#), bullet lists (* / -), numbered lists, line breaks.
 */
export default function Markdown({ text, className = '' }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ul' or 'ol'
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      const listClass = listType === 'ol'
        ? 'list-decimal list-inside my-1 space-y-0.5'
        : 'list-disc list-inside my-1 space-y-0.5';
      elements.push(
        <Tag key={key++} className={listClass}>
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const sizes = { 1: 'text-base font-bold', 2: 'text-sm font-bold', 3: 'text-sm font-semibold', 4: 'text-xs font-semibold' };
      elements.push(
        <p key={key++} className={`${sizes[level] || sizes[3]} mt-2 mb-0.5`}>
          {renderInline(text)}
        </p>
      );
      continue;
    }

    // Unordered list (* or -)
    const ulMatch = line.match(/^\s*[*\-]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    }

    // Ordered list (1. 2. etc)
    const olMatch = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="my-0.5">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={`text-sm leading-relaxed ${className}`}>{elements}</div>;
}

function renderInline(text) {
  // Split by inline patterns: **bold**, *italic*, `code`
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    let earliest = null;
    let earliestIdx = remaining.length;

    if (boldMatch && boldMatch.index < earliestIdx) {
      earliest = { type: 'bold', match: boldMatch };
      earliestIdx = boldMatch.index;
    }
    if (codeMatch && codeMatch.index < earliestIdx) {
      earliest = { type: 'code', match: codeMatch };
      earliestIdx = codeMatch.index;
    }
    if (italicMatch && italicMatch.index < earliestIdx) {
      earliest = { type: 'italic', match: italicMatch };
      earliestIdx = italicMatch.index;
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    // Text before the match
    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }

    const { type, match } = earliest;
    if (type === 'bold') {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (type === 'code') {
      parts.push(
        <code key={key++} className="bg-black/5 px-1 py-0.5 rounded text-xs font-mono">
          {match[1]}
        </code>
      );
    } else if (type === 'italic') {
      parts.push(<em key={key++}>{match[1]}</em>);
    }

    remaining = remaining.slice(earliestIdx + match[0].length);
  }

  return parts;
}
