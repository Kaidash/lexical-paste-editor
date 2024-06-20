import React, { useState, useRef, useEffect } from 'react';
import { Image } from '../types';
import './SelectImage.css';

interface Item {
  name: string;
  url: string;
}

interface SelectImageProps {
  label: string;
  images: Image[];
  onChange: (value: string) => void;
  onSelect: (selectedItem: Image) => void;
  onFocus: () => void;
}

const SelectImage: React.FC<SelectImageProps> = ({
  label,
  images,
  onChange,
  onFocus,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    onChange(term);
  };

  const handleSelectItem = (item: Item) => {
    setSearchTerm(item.name);
    onSelect(item);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
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
          onFocus={onFocus}
          onChange={handleInputChange}
        />
        {isOpen && (
          <div className="SelectImage__optionsContainer">
            {images.map((item, index) => (
              <div
                key={index}
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
