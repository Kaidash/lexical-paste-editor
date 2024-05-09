import { useState } from 'react';
import { Editor, EditorContext } from '../lib/main.tsx';
import SmallEditor from './components/SmallEditor.tsx';

import '../lib/index.css';

const textHTML =
  '<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Engine oil change interval</span><span style="white-space: pre-wrap;">Unscrew the item</span></p>';

function App() {
  const [pasteText, setPasteText] = useState<string>('');
  const axios = async (img: string): Promise<string> => {
    // const test =
    //   'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2@2x.png';
    return img;
  };
  const handleAddImage = async (img: string): Promise<string> => {
    const data = await axios(img);
    console.log(data);
    return data;
  };

  const handleRemoveImage = async (src: string): Promise<boolean> => {
    console.log(src, 'remove image');
    return true;
  };

  const onUpdateText = async () => {
    // console.log(text, 'HTML');
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 transition-colors duration-500">
      <EditorContext>
        <Editor
          placeholderText="Paste selected phrase..."
          pasteText={pasteText}
          initHtml={textHTML}
          onUpdateText={onUpdateText}
          onUploadImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
        />
      </EditorContext>
      <SmallEditor onSave={(text: string) => setPasteText(text)} />
    </div>
  );
}

export default App;
