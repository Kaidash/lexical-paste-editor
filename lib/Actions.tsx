import { CLEAR_EDITOR_COMMAND } from 'lexical'
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext'
import { $generateHtmlFromNodes } from '@lexical/html'

export function Actions() {
  const [editor] = useLexicalComposerContext()

  function handleOnSave() {
    const htmlString = editor
      .getEditorState()
      .read(() => $generateHtmlFromNodes(editor, null))
    console.log(htmlString)
  }

  function handleOnClear() {
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
    editor.focus()
  }

  return (
    <div className="editor-actions">
      <button onClick={handleOnSave}>Save</button>
      <button onClick={handleOnClear}>Clear</button>
    </div>)
}
