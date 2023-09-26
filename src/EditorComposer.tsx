import React from "react";

import {
  LexicalComposer,
  InitialEditorStateType,
} from "@lexical/react/LexicalComposer";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import { TableContext } from "./plugins/TablePlugin";

import "./EditorComposer.css";

interface IEditorComposer {
  children: React.ReactElement;
  initialEditorState?: InitialEditorStateType;
}

const EditorComposer = ({ children, initialEditorState }: IEditorComposer) => {
  const initialConfig = {
    namespace: "VerbumEditor",
    nodes: [...PlaygroundNodes],
    onError: (error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
    editorState: initialEditorState,
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TableContext>
        <div className="editor-shell">{children}</div>
      </TableContext>
    </LexicalComposer>
  );
};

export default EditorComposer;
