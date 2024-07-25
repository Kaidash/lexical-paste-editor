import { useLayoutEffect } from 'react';
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  KEY_DOWN_COMMAND,
  SELECTION_CHANGE_COMMAND,
  SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_CRITICAL,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  DELETE_CHARACTER_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isTextNode,
  BaseSelection,
  LexicalNode,
  TextNode,
} from 'lexical';

import { mergeRegister } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const EnterKeyPlugin = ({
  onFocus = () => {},
  onDelete = () => {},
  onInsert = () => {},
}: {
  onFocus: (editorState: { key: string }) => void;
  onDelete: (text: string) => void;
  onInsert: (text: string) => void;
}) => {
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
        CONTROLLED_TEXT_INSERTION_COMMAND,
        (value: string | InputEvent): boolean => {
          if (typeof value === 'string') {
            onInsert(value);
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),

      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        (): boolean => {
          const selection: BaseSelection | null = $getSelection();
          if (selection) {
            const nodes: LexicalNode[] = selection.getNodes();
            const node: LexicalNode | TextNode = nodes[0];
            if ($isTextNode(node)) {
              onDelete(node?.__text);
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        SELECTION_INSERT_CLIPBOARD_NODES_COMMAND,
        (): boolean => {
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        UNDO_COMMAND,
        (): boolean => {
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        REDO_COMMAND,
        (): boolean => {
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
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
  }, [editor, onFocus, onDelete]);
  return null;
};

export default EnterKeyPlugin;
