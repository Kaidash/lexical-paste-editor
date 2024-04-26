import { useState } from 'react';
import { Editor, EditorContext } from '../lib/main';
import SmallEditor from './components/SmallEditor.tsx';
import '../lib/index.css';

// import { Editor } from '../dist/main';

function App() {
  const [pasteText, setPasteText] = useState<string>('')
  return (
    <div className="bg-gray-50 dark:bg-slate-800 transition-colors duration-500">
      <EditorContext>
        <Editor placeholderText='...' pasteText={pasteText} />
      </EditorContext>
      <SmallEditor onSave={(text: string) =>  setPasteText(text)} />
    </div>
  );
}

export default App;
