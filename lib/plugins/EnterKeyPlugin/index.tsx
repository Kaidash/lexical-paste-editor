import { useLayoutEffect } from 'react';
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  BaseSelection,
  LexicalNode,
} from 'lexical';

import { mergeRegister } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const EnterKeyPlugin = ({ onFocus }: { onFocus: (editorState: { key: string }) => void }) => {
  const [editor] = useLexicalComposerContext();
  useLayoutEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent): boolean => {
          if (event) {
            const allowedCharactersRegex: RegExp = /[.,?!:;\s]/;
            if (!allowedCharactersRegex.test(event.key)) {
              event.preventDefault();
            }
            return false;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (): boolean => {
          const selection: BaseSelection | null = $getSelection();

          if (selection) {
            const nodes: LexicalNode[] = selection.getNodes();
            const node: LexicalNode | undefined = nodes[0];

            if (node.__key) {
              onFocus({ key: node.__key });
            }
          }

          return false;
        },
        COMMAND_PRIORITY_NORMAL
      )
    );
  }, [editor, onFocus]);
  return null;
};

export default EnterKeyPlugin;
