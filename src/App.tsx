import { useState } from 'react';
import { Editor, EditorContext } from '../lib/main.tsx';
import SmallEditor from './components/SmallEditor.tsx';

import '../lib/index.css';

const textHTML =
  '<p class="PlaygroundEditorTheme__paragraph"><img src="https://s3.amazonaws.com/images.seroundtable.com/google-black-1545140719.jpg" alt="" width="inherit" height="inherit" position="left"></p><div class="AttentionMessage__wrapper" data-lexical-attention-message="true"><p class="PlaygroundEditorTheme__paragraph"><br></p></div><p class="PlaygroundEditorTheme__paragraph"><br></p>';

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

  const onUpdateText = async (text: string) => {
    console.log(text, 'HTML');
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
            onUpdateText={onUpdateText}
            onSearchImages={onSearchImages}
          />
        </>
      </EditorContext>
      <SmallEditor onSave={(text: string) => setPasteText(text)} />
    </div>
  );
}

export default App;
