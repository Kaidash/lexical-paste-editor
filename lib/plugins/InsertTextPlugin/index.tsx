import {useEffect} from 'react'
import { $createTextNode, $getSelection } from 'lexical';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'

interface LastPosition {
  key: string,
}

const InsertTextPlugin = ({ pasteText, lastPosition }: { pasteText?: string, lastPosition?: LastPosition}) => {
  const [editor] = useLexicalComposerContext()

  useEffect( () => {
    if (pasteText && lastPosition) {
      editor.focus()
      editor.update(() => {
        const node = editor._editorState._nodeMap.get(lastPosition.key)
        if (node) {
          const prevText = node.getTextContent()
          const selection = $getSelection()
          console.log(selection && selection.getNodes(), '+0-')
          if (selection) {
            // console.log(lastPostition.key, 'lastPostition.key')
            // console.log(selection, 'selection');
            selection.insertNodes([$createTextNode(pasteText).setMode('token')])
          }
        }


      })
    }
  }, [pasteText])

  return null
}

export default InsertTextPlugin;
