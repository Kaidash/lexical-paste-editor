import { useState } from 'react';
import { Editor, EditorContext } from '../lib/main.tsx';
import SmallEditor from './components/SmallEditor.tsx';

import '../lib/index.css';

const textHTML =
  '<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Engine oil change interval</span><span style="white-space: pre-wrap;">Unscrew the item</span></p>';

const mockImages = [
  {
    name: 'Test',
    url: 'https://s3.amazonaws.com/images.seroundtable.com/google-black-1545140719.jpg',
  },
  {
    name: 'Test2',
    url: 'https://s3.amazonaws.com/images.seroundtable.com/google-black-1545140719.jpg',
  },
];

function App() {
  const [pasteText, setPasteText] = useState<string>('');

  const onUpdateEditor = async (text: string) => {
    console.log(text, 'update text');
  };

  const onRemoveText = async (text: string) => {
    console.log(text, 'removed text');
  };

  const onInsertText = async (text: string) => {
    console.log(text, 'insert text');
  };

  const onSearchImages = async () => {
    return mockImages;
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 transition-colors duration-500">
      <EditorContext>
        <>
          <Editor
            placeholderText="Paste selected phrase..."
            pasteText={pasteText}
            initHtml={textHTML}
            onUpdateEditor={onUpdateEditor}
            onInsertText={onInsertText}
            onRemoveText={onRemoveText}
            onSearchImages={onSearchImages}
          />
        </>
      </EditorContext>
      <SmallEditor onSave={(text: string) => setPasteText(text)} />
    </div>
  );
}

export default App;
