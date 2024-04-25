import { useState } from 'react';
import { Editor } from '../lib/main';
// import { Editor } from '../dist/main';

function App() {

  return (
    <div className="bg-gray-50 dark:bg-slate-800 transition-colors duration-500">
      <Editor pasteText='...' />
    </div>
  );
}

export default App;
