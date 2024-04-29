import { LexicalComposer } from '@lexical/react/LexicalComposer';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { TableContext } from './plugins/TablePlugin';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

export default function EditorContext({ children }: { children: JSX.Element }): JSX.Element {
  const initialConfig = {
    editorState: undefined,
    namespace: 'Playground',
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
