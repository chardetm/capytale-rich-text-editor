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
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import ContextMenuPlugin from "./plugins/ContextMenuPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import PageBreakPlugin from "./plugins/PageBreakPlugin";
import PollPlugin from "./plugins/PollPlugin";
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

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";

// Capytale
import { $createParagraphNode, $getRoot } from "lexical";

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
  onChange?: (editorState: string, editorInstance?: LexicalEditor) => void;
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
  const placeholderComponent = <Placeholder>{placeholder}</Placeholder>;

  useEffect(() => {
    editor.setEditable(isEditable);
  }, [isEditable]);

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
      {(isEditable || showToolbarReadOnly) && (<ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />)}
      <div className={`editor-container`}>
        {maxLength && <MaxLengthPlugin maxLength={maxLength} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
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
          <InlineImagePlugin />
          <LinkPlugin />
          {!isEditable && <LexicalClickableLinkPlugin />}
          <PollPlugin />
          <YouTubePlugin />
          {isEditable && <FloatingTextFormatToolbarPlugin />}
          <HorizontalRulePlugin />
          <EquationsPlugin />
          <TabFocusPlugin />
          <TabIndentationPlugin />
          <CollapsiblePlugin />
          <PageBreakPlugin />
          <LayoutPlugin />
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
