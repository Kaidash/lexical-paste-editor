/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect, useRef, useState } from 'react';
import { LexicalEditor } from 'lexical';

import Button from '../../ui/Button';
import { DialogActions } from '../../ui/Dialog';
import SelectImage from '../../ui/SelectImage';
import Select from '../../ui/Select';

import type { Position } from '../../nodes/InlineImageNode';
import { Image } from '../../types';

import { INSERT_INLINE_IMAGE_COMMAND } from '../InlineImagePlugin';

import '../../nodes/InlineImageNode.css';

export function InsertPreselectedImageDialog({
  activeEditor,
  onClose,
  onSearchImages,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  onSearchImages: (value: string) => Promise<Image[] | []>;
}): JSX.Element {
  const hasModifier = useRef(false);

  const [src, setSrc] = useState('');
  const [altText, setAltText] = useState('');
  const [images, setImages] = useState<Image[] | []>([]);
  const [showCaption, setShowCaption] = useState(false);
  const [position, setPosition] = useState<Position>('left');

  const isDisabled = src === '';

  const handleShowCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCaption(e.target.checked);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as Position);
  };

  const loadImage = (image: Image) => {
    setSrc(image.url);
    setAltText(image.name);
  };

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [activeEditor]);

  const handleOnClick = () => {
    const payload = { altText, position, showCaption, src };
    activeEditor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload);
    onClose();
  };

  const handleOnChangeSelectImage = async (value: string = ''): Promise<void> => {
    const response: Image[] | [] = await onSearchImages(value);

    setImages(response);
  };

  return (
    <>
      <div style={{ marginBottom: '1em' }}>
        <SelectImage
          label="Search image"
          images={images}
          onSelect={loadImage}
          onFocus={handleOnChangeSelectImage}
          onChange={handleOnChangeSelectImage}
        />
      </div>

      <Select
        style={{ marginBottom: '1em' }}
        label="Position"
        name="position"
        id="position-select"
        onChange={handlePositionChange}
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="full">Full Width</option>
      </Select>

      <div className="Input__wrapper">
        <input
          id="caption"
          className="InlineImageNode_Checkbox"
          type="checkbox"
          checked={showCaption}
          onChange={handleShowCaptionChange}
        />
        <label htmlFor="caption">Show Caption</label>
      </div>

      <DialogActions>
        <Button
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => handleOnClick()}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}
