import { useState } from 'react';
import { Editor, EditorContext } from '../lib/main.tsx';

import '../lib/index.css';

const textHTML =
  '<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">Engine oil change interval</span><span style="white-space: pre-wrap;">Unscrew the item</span></p>';

const images = [
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
  const [pasteText] = useState<string>('');
  // const axios = async (img: string): Promise<string> => {
  //   // const test =
  //   //   'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2@2x.png';
  //   return img;
  // };

  const onUpdateText = async () => {
    // console.log(text, 'HTML');
  };

  const onSearchImages = (value: string) => {
    console.log(value, 'search images');
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 transition-colors duration-500">
      <EditorContext>
        <>
          <Editor
            placeholderText="Paste selected phrase..."
            pasteText={pasteText}
            initHtml={textHTML}
            images={images}
            onUpdateText={onUpdateText}
            onSearchImages={onSearchImages}
          />
        </>
      </EditorContext>
    </div>
  );
}

export default App;
