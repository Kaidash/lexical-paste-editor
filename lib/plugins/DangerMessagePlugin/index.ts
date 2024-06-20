/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './index.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { $createParagraphNode, COMMAND_PRIORITY_LOW, createCommand, ParagraphNode } from 'lexical';
import { useEffect } from 'react';

import { $createDangerMessageNode, DangerMessageNode } from './DangerMessageNode.tsx';

export const INSERT_DANGER_MESSAGE_COMMAND = createCommand<void>();

export default function DangerMessagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([DangerMessageNode])) {
      throw new Error('DangerMessageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_DANGER_MESSAGE_COMMAND,
        (): boolean => {
          editor.update((): void => {
            const paragraph: ParagraphNode = $createParagraphNode();
            $insertNodeToNearestRoot($createDangerMessageNode().append(paragraph));
            paragraph.select();
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
