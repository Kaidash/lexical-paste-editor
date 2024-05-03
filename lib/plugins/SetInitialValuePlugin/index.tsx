import { useLayoutEffect } from 'react';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export const SetInitialValuePlugin: React.FC<{ initHtml: string }> = ({ initHtml = '' }) => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (editor && initHtml) {
      editor.update(() => {
        const content = $generateHtmlFromNodes(editor, null);

        if (!!initHtml && content !== initHtml) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initHtml, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);

          const root = $getRoot();
          root.clear();

          const selection = root.select();
          selection.removeText();
          selection.insertNodes(nodes);
        }
      });
    }
  }, [initHtml]);

  return null;
};

export default SetInitialValuePlugin;
