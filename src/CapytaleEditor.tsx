import React, { useCallback, useEffect } from "react";

import EditorComposer from "./EditorComposer";
import Editor from "./Editor";
import { InitialEditorStateType } from "@lexical/react/LexicalComposer";

import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getRoot, EditorState } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import "./CapytaleEditor.css";
import { useEditorContext } from "./contexts/EditorContext";

const byteSize = (str: string): number => new Blob([str]).size;

export interface ICapytaleEditorContentProps {
  isEditable?: boolean;
  useLexicalContextMenu?: boolean;
  onChange?: () => void;
  onJsonChange?: (json: string) => void;
  onJsonSizeLimitExceeded?: () => void;
  onJsonSizeLimitMet?: () => void;
  jsonSizeLimit?: number;
  sizeCheckInterval?: number;
  htmlInitialContent?: string;
}

function CapytaleEditorContent({
  isEditable,
  useLexicalContextMenu,
  onChange,
  onJsonChange,
  onJsonSizeLimitExceeded = () => {
    alert(
      `Le contenu de l'éditeur est trop volumineux. Veuillez le réduire avant de l'enregistrer.\nPeut-être avez-vous inséré une image trop volumineuse ?`
    );
  },
  onJsonSizeLimitMet,
  jsonSizeLimit,
  sizeCheckInterval,
  htmlInitialContent,
}: ICapytaleEditorContentProps) {
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

  const capytaleRichTextEditorContext = useEditorContext();

  const [jsonTooBig, setJsonTooBig] = React.useState(false);

  const checkIfTooBig = useCallback(async () => {
    const state = await capytaleRichTextEditorContext.getState(true, false);
    if (!state) {
      return;
    }

    if (byteSize(state.json) > jsonSizeLimit) {
      if (!jsonTooBig) {
        setJsonTooBig(true);
        capytaleRichTextEditorContext.setCanSave &&
          capytaleRichTextEditorContext.setCanSave(false);
        setTimeout(() => {
          onJsonSizeLimitExceeded && onJsonSizeLimitExceeded();
        }, 1);
      }
    } else {
      if (jsonTooBig) {
        setTimeout(() => {
          onJsonSizeLimitMet && onJsonSizeLimitMet();
        }, 1);
        setJsonTooBig(false);
        capytaleRichTextEditorContext.setCanSave &&
          capytaleRichTextEditorContext.setCanSave(true);
      }
    }
  }, [jsonTooBig, capytaleRichTextEditorContext, jsonSizeLimit]);

  useEffect(() => {
    if (
      !sizeCheckInterval ||
      !jsonSizeLimit ||
      !capytaleRichTextEditorContext
    ) {
      return;
    }
    const interval = setInterval(checkIfTooBig, sizeCheckInterval);
    return () => clearInterval(interval);
  }, [jsonTooBig, capytaleRichTextEditorContext, jsonSizeLimit]);

  return (
    <div className={"editor-inner" + (jsonTooBig ? " too-big" : "")}>
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
}

export interface ICapytaleEditorProps {
  isEditable?: boolean;
  useLexicalContextMenu?: boolean;
  onChange?: () => void;
  onJsonChange?: (json: string) => void;
  onJsonSizeLimitExceeded?: () => void;
  onJsonSizeLimitMet?: () => void;
  jsonSizeLimit?: number;
  sizeCheckInterval?: number;
  initialEditorState?: InitialEditorStateType;
  htmlInitialContent?: string;
}

function CapytaleEditor({
  isEditable = true,
  useLexicalContextMenu = false,
  onChange,
  onJsonChange,
  onJsonSizeLimitExceeded,
  onJsonSizeLimitMet,
  jsonSizeLimit,
  sizeCheckInterval = 2000,
  initialEditorState,
  htmlInitialContent,
}: ICapytaleEditorProps) {
  if (htmlInitialContent) {
    initialEditorState = null;
  }
  return (
    <EditorComposer initialEditorState={initialEditorState}>
      <CapytaleEditorContent
        onChange={onChange}
        onJsonChange={onJsonChange}
        onJsonSizeLimitExceeded={onJsonSizeLimitExceeded}
        onJsonSizeLimitMet={onJsonSizeLimitMet}
        jsonSizeLimit={jsonSizeLimit}
        sizeCheckInterval={sizeCheckInterval}
        isEditable={isEditable}
        useLexicalContextMenu={useLexicalContextMenu}
        htmlInitialContent={htmlInitialContent}
      />
    </EditorComposer>
  );
}

export default CapytaleEditor;
