import { LexicalComposer } from "@lexical/react/LexicalComposer";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import { TableContext } from "./plugins/TablePlugin";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { LexicalEditor } from "lexical";

export default function EditorContext({
                                children,
                              }: {
  children: JSX.Element;
}): JSX.Element {
  const initialConfig = {
    editorState: undefined,
    namespace: "Playground",
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>{children}</SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export function RegisterEditor({
                                 id,
                                 children,
                               }: {
  id: string;
  children: JSX.Element;
}) {
  const [editor] = useLexicalComposerContext();

  // useEffect(() => {
  //   setEditors((editors) => ({ ...editors, [id]: editor }));
  // }, [id, setEditors]);

  return children;
}

export function getEditorState(editor: LexicalEditor): string {
  return JSON.stringify(editor.getEditorState().toJSON());
}

export function setEditorState(editor: LexicalEditor, state: string) {
  editor.setEditorState(editor.parseEditorState(JSON.parse(state)));
}
