'use client';

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onDirty?: () => void;
  minimal?: boolean;
};

/**
 * Long-form editor for article and page bodies. The HTML is mirrored into a
 * hidden input so the surrounding form posts it like any other field, and it
 * is sanitised again on the server before it is stored.
 */
export default function RichTextEditor({
  name,
  defaultValue = '',
  placeholder = 'Write your article here…',
  onDirty,
  minimal = false,
}: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: minimal ? [3] : [2, 3, 4] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: 'a-prosemirror', role: 'textbox', 'aria-multiline': 'true' },
    },
    onUpdate: ({ editor: instance }) => {
      setHtml(instance.getHTML());
      onDirty?.();
    },
  });

  useEffect(() => setMounted(true), []);

  if (!editor || !mounted) {
    return (
      <div className="a-editor">
        <div className="a-editor-surface">
          <p className="a-hint">Loading the editor…</p>
        </div>
        <input type="hidden" name={name} value={html} readOnly />
      </div>
    );
  }

  const tool = (
    key: string,
    label: string,
    run: () => void,
    active?: boolean,
    title?: string
  ) => (
    <button
      key={key}
      type="button"
      className="a-tool"
      data-active={active ? 'true' : 'false'}
      onMouseDown={(event) => event.preventDefault()}
      onClick={run}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={active}
    >
      {label}
    </button>
  );

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href ?? '';
    const input = window.prompt('Link address (https://… or mailto:…)', previous);
    if (input === null) return;
    if (input === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|\/)/i.test(input)) {
      window.alert('Please use a full address starting with https:// or mailto:');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: input }).run();
  }

  function insertImage() {
    if (!editor) return;
    const input = window.prompt(
      'Image address — upload it in the Media Library first, then paste its address here'
    );
    if (!input) return;
    if (!/^(https?:\/\/|\/uploads\/)/i.test(input)) {
      window.alert('Please use an uploaded image address (it starts with /uploads/).');
      return;
    }
    editor.chain().focus().setImage({ src: input }).run();
  }

  const words = editor.getText().split(/\s+/).filter(Boolean).length;

  return (
    <div className="a-editor">
      <div className="a-editor-toolbar" role="toolbar" aria-label="Text formatting">
        {!minimal && (
          <>
            {tool('p', 'Paragraph', () => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph'))}
            {tool('h2', 'H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), 'Heading')}
            {tool('h3', 'H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), 'Sub-heading')}
            <span className="a-tool-divider" aria-hidden />
          </>
        )}
        {tool('b', 'B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold')}
        {tool('i', 'I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic')}
        {tool('u', 'U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), 'Underline')}
        <span className="a-tool-divider" aria-hidden />
        {tool('ul', '• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bulleted list')}
        {tool('ol', '1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Numbered list')}
        {tool('quote', '❝', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Quote')}
        <span className="a-tool-divider" aria-hidden />
        {tool('link', 'Link', setLink, editor.isActive('link'), 'Add or edit a link')}
        {!minimal && tool('img', 'Image', insertImage, false, 'Insert an uploaded image')}
        {!minimal && tool('hr', '—', () => editor.chain().focus().setHorizontalRule().run(), false, 'Divider')}
        <span className="a-tool-divider" aria-hidden />
        {tool('undo', '↶', () => editor.chain().focus().undo().run(), false, 'Undo')}
        {tool('redo', '↷', () => editor.chain().focus().redo().run(), false, 'Redo')}
      </div>

      <div className="a-editor-surface">
        <EditorContent editor={editor} />
      </div>

      <div className="a-editor-count">
        <span>{words} word{words === 1 ? '' : 's'}</span>
        <span>≈ {Math.max(1, Math.round(words / 200))} min read</span>
      </div>

      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
