import {useRef, useState} from 'react'
import {useEffect} from 'react'
import {useLayoutEffect} from 'react'

import './index.css';

// import useMediaQuery from './hooks/useMediaQuery'

import type {EditorState}from 'lexical'
import {$getSelection, $createTextNode} from 'lexical'

import { mergeRegister } from '@lexical/utils'

import {LexicalComposer } from '@lexical/react/LexicalComposer'
import {ListPlugin } from '@lexical/react/LexicalListPlugin'
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin'
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin'
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin'
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin'
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin'
import {TablePlugin} from '@lexical/react/LexicalTablePlugin'
import {CheckListPlugin}  from '@lexical/react/LexicalCheckListPlugin'
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin'
import {TRANSFORMERS} from '@lexical/markdown'
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  KEY_DOWN_COMMAND,
  FOCUS_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'



import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'

import Nodes from './nodes'
import EditorTheme from './themes/PlaygroundEditorTheme.ts'

import {Actions} from './Actions'
import DragDropPaste from './plugins/DragDropPastePlugin'
// import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin'
import LinkPlugin from './plugins/LinkPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import ContentEditable from './ui/ContentEditable'
import Placeholder from './ui/Placeholder'
import LexicalAutoLinkPlugin from './plugins/AutoLinkPlugin/index'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import InlineImagePlugin from './plugins/InlineImagePlugin'
import TableCellResizer from './plugins/TableCellResizer';
// import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin'

interface LastPosition {
  key: string,
  offset: number
}

const loadContent = () => {
  // 'empty' editor
  const value = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'

  return value
}


const InsertTextPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.update(() => {
      const selection = $getSelection()
      console.log(selection, 'asd')
      // if (selection) {
      //   selection.insertText('the text I wanted to insert')
      // }
    })
  }, [editor])

  return null
}

const EnterKeyPlugin = ({ pasteText, lastPostition, onFocus }: {
  pasteText: string
  lastPostition: LastPosition | null,
  onFocus: (editorState: { offset: never; key: string }) => void;
}) => {
  const [editor] = useLexicalComposerContext()
  useLayoutEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) => {
          if (event) {
            if (event.code !== 'Space') {
              event.preventDefault()
            }
            // editor.setEditable(false)
            // setTimeout(() => $generateTest(editor), 500)
            return false
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        (event) => {
          if (event) {
            console.log(event)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection()

          if (selection) {
            const [node] = selection.getNodes()

            onFocus({
              key: node.__key,
              // @ts-ignore:next-line
              offset: selection.focus ? selection?.focus?.offset : 0,
            })
            console.log({
              key: node.__key,
              // @ts-ignore
              offset: selection.focus ? selection?.focus?.offset : 0,
            })
          }

          return false
        },
        COMMAND_PRIORITY_NORMAL
      )
    )
  }, [editor, onFocus])

  // const putStringToText = (text: string, inputText: string, index: number): string => {
  //   console.log('11111111')
  //   console.log(text)
  //   console.log(inputText)
  //   console.log(index)
  //   console.log('11111111')
  //
  //   if (index < 0 || index > text.length) {
  //     return text
  //   }
  //
  //   return  text.substring(0, index) + inputText + text.substring(index + 1)
  // }

  useEffect( () => {
    if (pasteText && lastPostition) {
      editor.focus()
      editor.update(() => {
        const node = editor._editorState._nodeMap.get(lastPostition.key)
        if (node) {
          // const prevText = node.getTextContent()
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


export default function Editor({ pasteText }: {
  pasteText: string
}) {
  const [, setIsLinkEditMode] = useState<boolean>(false);

  const [lastPostition, setLastPosition] = useState<LastPosition | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const isSmallWidthViewPort = useMediaQuery('(max-width: 1025px)')
  // const [setFloatingAnchorElem] =
  //   useState<HTMLDivElement | undefined>(undefined)

  const placeholder = <Placeholder>Enter some rich text...</Placeholder>
  const initialEditorState = loadContent()
  const editorStateRef = useRef<EditorState>()
  const initialConfig = {
    namespace: 'MyEditor',
    editorState: initialEditorState,
    theme: EditorTheme,
    nodes: [...Nodes],
    onError: () => {},
    showTreeView: true,
  }



  function handleOnChange(editorState: EditorState) {
    console.log(editorState._nodeMap)
    const json = editorState.toJSON()
    console.log('============')
    console.log(json)
    console.log('============')
    editorStateRef.current = editorState
  }

  function handleOnFocus(lastPositionProp: LastPosition) {
    setLastPosition(lastPositionProp)
  }

  // const onRef = (_floatingAnchorElem: HTMLDivElement) => {
  //   if (_floatingAnchorElem !== null) {
  //     // @ts-ignore
  //     setFloatingAnchorElem(_floatingAnchorElem)
  //   }
  // }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-shell">
        <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode}/>
        <div
          className="editor-container tree-view">
          <ClearEditorPlugin/>
          <LexicalAutoLinkPlugin />
          <InlineImagePlugin />
          <CheckListPlugin />
          <RichTextPlugin
            contentEditable={
              <div className="editor-scroller">
                <div className="editor">
                  <ContentEditable
                  />
                </div>
              </div>
            }
            placeholder={placeholder}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <EnterKeyPlugin pasteText={pasteText} lastPostition={lastPostition} onFocus={handleOnFocus} />
          <OnChangePlugin onChange={handleOnChange}  />
          <InsertTextPlugin />
          <HistoryPlugin />
          <DragDropPaste/>
          <ListPlugin />
          <CodeHighlightPlugin />
          <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
          <TableCellResizer />
          <HorizontalRulePlugin />
          <LinkPlugin />
          {/*{floatingAnchorElem && !isSmallWidthViewPort && (*/}
          {/*  <FloatingLinkEditorPlugin isLinkEditMode={true} setIsLinkEditMode={setFloatingAnchorElem} anchorElem={floatingAnchorElem} />*/}
          {/*)}*/}
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <Actions />
          {/*<TreeViewPlugin/>*/}
        </div>
      </div>
    </LexicalComposer>
  )
}
