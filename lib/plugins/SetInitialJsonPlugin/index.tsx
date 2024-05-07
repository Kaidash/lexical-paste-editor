import { useLayoutEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export const SetInitialJsonPlugin: React.FC<{ value: string }> = ({ value = '' }) => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (editor && value) {
      editor.update(() => {
        const editorState = editor.parseEditorState(value);
        editor.setEditorState(editorState);
      });
    }
  }, [value]);

  return null;
};

export default SetInitialJsonPlugin;
