import React, { useEffect } from "react";

import EditorComposer from "./EditorComposer";
import Editor from "./Editor";
import { InitialEditorStateType } from "@lexical/react/LexicalComposer";

import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getRoot, EditorState } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import "./CapytaleEditor.css";

export interface ICapytaleEditorContentProps {
  isEditable?: boolean;
  useLexicalContextMenu?: boolean;
  onChange?: () => void;
  onJsonChange?: (json: string) => void;
  htmlInitialContent?: string;
}
const CapytaleEditorContent: React.FC<ICapytaleEditorContentProps> = ({
  isEditable,
  useLexicalContextMenu,
  onChange,
  onJsonChange,
  htmlInitialContent,
}) => {
  const [initialized, setInitialized] = React.useState(false);
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (htmlInitialContent && !initialized) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlInitialContent, "text/html");
      editor.update(() => {
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().clear().select();
        $insertNodes(nodes);
      });
      setInitialized(true);
    }
  }, [htmlInitialContent, initialized]);

  return (
    <div className="editor-inner">
      <Editor
        draggableBlocksEnabled={true}
        hashtagsEnabled={true}
        autoLinkEnabled={false}
        emojisEnabled={false}
        placeholder="Écrivez votre texte ici..."
        isEditable={isEditable}
        useLexicalContextMenu={useLexicalContextMenu}
        onChange={
          !onChange && !onJsonChange
            ? undefined
            : (editorState: EditorState) => {
                if (onChange) {
                  onChange();
                }
                if (onJsonChange) {
                  const json = JSON.stringify(editorState);
                  onJsonChange(json);
                }
              }
        }
      />
    </div>
  );
};

export interface ICapytaleEditorProps {
  isEditable?: boolean;
  useLexicalContextMenu?: boolean;
  onChange?: () => void;
  onJsonChange?: (json: string) => void;
  initialEditorState?: InitialEditorStateType;
  htmlInitialContent?: string;
}

const CapytaleEditor: React.FC<ICapytaleEditorProps> = ({
  isEditable = true,
  useLexicalContextMenu = false,
  onChange,
  onJsonChange,
  initialEditorState,
  htmlInitialContent,
}): React.ReactElement => {
  if (htmlInitialContent) {
    initialEditorState = null;
  }
  return (
    <EditorComposer initialEditorState={initialEditorState}>
      <CapytaleEditorContent
        onChange={onChange}
        onJsonChange={onJsonChange}
        isEditable={isEditable}
        useLexicalContextMenu={useLexicalContextMenu}
        htmlInitialContent={htmlInitialContent}
      />
    </EditorComposer>
  );
};

export default CapytaleEditor;
