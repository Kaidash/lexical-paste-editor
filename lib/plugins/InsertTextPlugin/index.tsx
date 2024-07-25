import { useEffect } from 'react';
import {
  $getSelection,
  $isTextNode,
  BaseSelection,
  LexicalNode,
  TextNode,
  CONTROLLED_TEXT_INSERTION_COMMAND,
} from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface LastPosition {
  key: string;
}

const InsertTextPlugin = ({
  pasteText,
  lastPosition,
}: {
  pasteText?: string;
  lastPosition?: LastPosition;
}): null => {
  const [editor] = useLexicalComposerContext();

  useEffect((): void => {
    if (pasteText && lastPosition) {
      editor.focus();
      editor.update((): void => {
        const node: LexicalNode | undefined = editor._editorState._nodeMap.get(lastPosition.key);
        if (node) {
          const selection: BaseSelection | null = $getSelection();
          if (selection) {
            editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, pasteText);
            const selection: BaseSelection | null = $getSelection();
            const nodes: LexicalNode[] | undefined = selection?.getNodes();
            if (nodes && nodes.length) {
              const node: LexicalNode | TextNode = nodes[0];
              if ($isTextNode(node)) {
                node.setMode('token');
              }
            }
          }
        }
      });
    }
  }, [pasteText]);

  return null;
};

export default InsertTextPlugin;
