/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import React, { ReactNode, useEffect, useState } from 'react';
import { useRef } from 'react';

import { useSettings } from './context/SettingsContext';
import { useSharedHistoryContext } from './context/SharedHistoryContext';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorContext from './context/EditorContext';
import { LexicalEditor } from 'lexical';
import { useTranslation } from 'react-i18next';
import DragDropPaste from './plugins/DragDropPastePlugin';

// Capytale
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import MarkdownTooglePlugin from './plugins/MarkdownTooglePlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import {
  $getSelection,
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getRoot,
} from 'lexical';

interface IEditorProps {
  children?: ReactNode;
  hashtagsEnabled?: boolean;
  autoLinkEnabled?: boolean;
  draggableBlocksEnabled?: boolean;
  emojisEnabled?: boolean;
  actionsEnabled?: boolean;
  toogleMarkdownEnabled?: boolean;
  placeholder?: string;
  listMaxIndent?: number;
  isEditable?: boolean;
  locale?: 'en' | 'fr' | 'ptBr' | 'ru' | null;
  onChange?: (editorState: string, editorInstance?: LexicalEditor) => void;
}

const Editor = ({
  children,
  hashtagsEnabled = false,
  autoLinkEnabled = false,
  draggableBlocksEnabled = false,
  emojisEnabled = false,
  actionsEnabled = false,
  toogleMarkdownEnabled = false,
  listMaxIndent = 7,
  placeholder = '',
  isEditable = true,
  locale = null,
  onChange,
}: IEditorProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  const editorStateRef = useRef(null);
  const { historyState } = useSharedHistoryContext();
  const {
    settings: { isRichText },
  } = useSettings();
  const placeholderComponent = <Placeholder>{placeholder}</Placeholder>;

  const { i18n } = useTranslation();

  useEffect(() => {
    editor.setEditable(isEditable);

    if (locale) i18n.changeLanguage(locale);
  }, []);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const addEndParagraph = () => {
    if (activeEditor) {
      activeEditor.update(() => {
        // Inserts a new paragraph at the end of the Lexical editor
        const rootNode = $getRoot();
        const lastChild = rootNode.getLastChild();
        const newParagraph = $createParagraphNode();
        lastChild.insertAfter(newParagraph);
        newParagraph.selectEnd();
      });
    }
  };

  return (
    <EditorContext.Provider
      value={{ initialEditor: editor, activeEditor, setActiveEditor }}
    >
      {children}
      <div className={`editor-container`}>
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        {hashtagsEnabled && <HashtagPlugin />}
        {emojisEnabled && <EmojisPlugin />}
        <KeywordsPlugin />
        <DragDropPaste />
        {autoLinkEnabled && <AutoLinkPlugin />}

        <>
          <RichTextPlugin
            contentEditable={
              <div className="editor-scroller">
                <div className="editor" ref={onRef}>
                  <ContentEditable />
                  <div
                    className="editor-add-paragraph"
                    onClick={addEndParagraph}
                    role='button'
                  >+</div>
                </div>
              </div>
            }
            placeholder={placeholderComponent}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(editorState) => {
              onChange?.(JSON.stringify(editorState), activeEditor);
              return (editorStateRef.current = editorState);
            }}
          />
          <MarkdownShortcutPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <ListMaxIndentLevelPlugin maxDepth={listMaxIndent} />
          <LinkPlugin />
          <LexicalClickableLinkPlugin />
          {isEditable && <FloatingTextFormatToolbarPlugin />}
          <TabFocusPlugin />
          <FloatingLinkEditorPlugin />
          {draggableBlocksEnabled && floatingAnchorElem && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            </>
          )}
        </>

        <HistoryPlugin externalHistoryState={historyState} />
        {toogleMarkdownEnabled && <MarkdownTooglePlugin />}
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
