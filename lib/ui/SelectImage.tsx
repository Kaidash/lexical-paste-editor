import React, { useState, useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash-es/debounce';

import { Image } from '../types';
import './SelectImage.css';

interface SelectImageProps {
  label: string;
  images: Image[] | [];
  onSelect: (selectedItem: Image) => void;
  onFocus: (value: string) => Promise<void>;
  onChange: (value: string) => Promise<void>;
}

const SelectImage: React.FC<SelectImageProps> = ({
  label,
  images = [],
  onChange,
  onFocus,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectItem = (item: Image) => {
    setSearchTerm(item.name);
    onSelect(item);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const debouncedFetchResults = useCallback(debounce(onChange, 500), []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const term: string = event.target.value;
    setSearchTerm(term);
    debouncedFetchResults(term);
  };

  const handleInputFocus = () => {
    onFocus(searchTerm);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="Input__wrapper SelectImage__wrapper" ref={dropdownRef}>
      <label className="Input__label">{label}</label>
      <div className="SelectImage__inputContainer" onClick={() => setIsOpen(!isOpen)}>
        <input
          className="Input__input"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
        />
        {isOpen && (
          <div className="SelectImage__optionsContainer">
            {images.map((item: Image) => (
              <div
                key={item.name}
                className="SelectImage__option"
                onClick={() => handleSelectItem(item)}
              >
                <img src={item.url} alt={item.name} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectImage;
