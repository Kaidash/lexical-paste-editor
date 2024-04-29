import { useState } from 'react';

const elasticaList = [
  'Air filter change steps:',
  '1 Liter',
  '4 Liters',
  '5 Liters',
  '1 NM',
  '2 NM',
  '3 NM',
  '4 NM',
  '5 000km',
  '10 000km',
  '15 000km',
  '30 000km',
  '60 000km',
  'Disconnect part',
  '(1)',
  '(2)',
  '(3)',
  '(4)',
  '(5)',
  '(6)',
  '(7)',
  '(8)',
  '(9)',
  '(10)',
  'Remove part',
  'Unscrew the item',
  'Engine oil change interval',
  'Breaks',
  'Manual for transmission',
];

const Note = ({
  text,
  onSelect,
}: {
  text: string;
  onSelect: (text: string) => void;
}): JSX.Element => {
  return (
    <span
      style={{ border: '1px solid black', padding: '5px', marginRight: '5px' }}
      onClick={() => onSelect(text)}
    >
      {text}
    </span>
  );
};

export function SmallEditor({ onSave }: { onSave: (text: string) => void }) {
  const [text, onChangeText] = useState<string>('');

  const onSelect = (value: string): void => {
    onChangeText(value);
  };

  const pushToEditor = (): void => {
    onSave(text);
    onChangeText('');
  };

  return (
    <div
      className="editor-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        {elasticaList.map((listItem: string): JSX.Element | null =>
          text && listItem.toLowerCase().includes(text.toLowerCase()) ? (
            <Note key={listItem} text={listItem} onSelect={onSelect} />
          ) : null
        )}
      </div>
      <textarea
        style={{ marginBottom: '20px', width: '300px', height: '150px' }}
        name="editor"
        id="editor"
        onChange={(event) => onChangeText(event.target.value)}
        value={text}
      />
      <button style={{ width: '100px' }} onClick={pushToEditor}>
        Push to editor
      </button>
    </div>
  );
}

export default SmallEditor;
