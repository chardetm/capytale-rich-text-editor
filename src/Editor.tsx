/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import LexicalClickableLinkPlugin from "@lexical/react/LexicalClickableLinkPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import React, { useEffect, useState } from "react";
import { useRef } from "react";

import TableCellNodes from "./nodes/TableCellNodes";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import ContextMenuPlugin from "./plugins/ContextMenuPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import { TablePlugin as NewTablePlugin } from "./plugins/TablePlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";

// Maths
import MathPlugin from "./plugins/MathPlugin";
import "mathlive/static.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState, LexicalEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

// Capytale
import { $createParagraphNode, $getRoot } from "lexical";
import { useEditorContext } from "./contexts/EditorContext";

interface IEditorProps {
  hashtagsEnabled?: boolean;
  autoLinkEnabled?: boolean;
  draggableBlocksEnabled?: boolean;
  emojisEnabled?: boolean;
  placeholder?: string;
  listMaxIndent?: number;
  isEditable?: boolean;
  maxLength?: number;
  characterLimit?: number;
  showTableOfContents?: boolean;
  useLexicalContextMenu?: boolean;
  showToolbarReadOnly?: boolean;
  onEditorStateChange?: (editorState: EditorState) => void;
  onChange?: (editorState: EditorState) => void;
}

const Editor = ({
  hashtagsEnabled = false,
  autoLinkEnabled = false,
  draggableBlocksEnabled = false,
  emojisEnabled = false,
  listMaxIndent = 7,
  placeholder = "",
  isEditable = true,
  maxLength = null,
  characterLimit = null,
  showTableOfContents = false,
  useLexicalContextMenu = false,
  showToolbarReadOnly = false,
  onChange,
}: IEditorProps) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  const editorStateRef = useRef(null);
  const placeholderComponent = isEditable ? (
    <Placeholder>{placeholder}</Placeholder>
  ) : null;

  const editorContext = useEditorContext();
  useEffect(() => {
    if (editorContext.setGetState) {
      editorContext.setGetState(() => {
        return (needJson: boolean = true, needHtml: boolean = true) => {
          return new Promise((resolve, reject) => {
            editor.update(() => {
              const html = needHtml ? $generateHtmlFromNodes(editor) : null;
              const json = needJson
                ? JSON.stringify(editor.getEditorState())
                : null;
              resolve({ html, json });
            });
          });
        };
      });
    }
  }, [editor]);

  useEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const cellEditorConfig = {
    namespace: "Capytale",
    nodes: [...TableCellNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
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
    <>
      {(isEditable || showToolbarReadOnly) && (
        <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
      )}
      <div className={`editor-container`}>
        {maxLength && <MaxLengthPlugin maxLength={maxLength} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        {emojisEnabled && <EmojiPickerPlugin />}
        <AutoEmbedPlugin />

        {emojisEnabled && <EmojisPlugin />}
        {hashtagsEnabled && <HashtagPlugin />}
        <KeywordsPlugin />
        {autoLinkEnabled && <AutoLinkPlugin />}

        <>
          <HistoryPlugin />
          <RichTextPlugin
            contentEditable={
              <div className="editor-scroller">
                <div className="editor" ref={onRef}>
                  <ContentEditable />
                  <div
                    className="editor-add-paragraph"
                    onClick={addEndParagraph}
                    role="button"
                  >
                    +
                  </div>
                </div>
              </div>
            }
            placeholder={placeholderComponent}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(editorState: EditorState, editor: LexicalEditor) => {
              if (onChange) {
                onChange(editorState);
              }
            }}
          />
          <MarkdownShortcutPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <ListMaxIndentLevelPlugin maxDepth={listMaxIndent} />
          <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
          <TableCellResizer />
          <NewTablePlugin cellEditorConfig={cellEditorConfig}>
            <AutoFocusPlugin />
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="TableNode__contentEditable" />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ImagesPlugin captionsEnabled={false} />
            <LinkPlugin />
            <LexicalClickableLinkPlugin />
            <FloatingTextFormatToolbarPlugin />
          </NewTablePlugin>
          <ImagesPlugin />
          <LinkPlugin />
          {!isEditable && <LexicalClickableLinkPlugin />}
          <YouTubePlugin />
          {isEditable && <FloatingTextFormatToolbarPlugin />}
          <HorizontalRulePlugin />
          <TabFocusPlugin />
          <TabIndentationPlugin />
          <CollapsiblePlugin />
          <LayoutPlugin />
          <MathPlugin />
          {isEditable && (
            <FloatingLinkEditorPlugin
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          )}
          {draggableBlocksEnabled && floatingAnchorElem && isEditable && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
              <TableCellActionMenuPlugin
                anchorElem={floatingAnchorElem}
                cellMerge={true}
              />
            </>
          )}
          {characterLimit && (
            <CharacterLimitPlugin
              charset={"UTF-16"}
              maxLength={characterLimit}
            />
          )}
          {showTableOfContents && (
            <div>
              {" "}
              <TableOfContentsPlugin />
            </div>
          )}
          {useLexicalContextMenu && <ContextMenuPlugin />}
        </>
      </div>
    </>
  );
};

export default Editor;
