/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  ListType,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import { $isTableNode } from '@lexical/table';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useState } from 'react';

import { IS_APPLE } from '../../shared';

import useModal from '../../hooks/useModal';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import { INSERT_PAGE_BREAK } from '../PageBreakPlugin';
import { INSERT_ATTENTION_MESSAGE_COMMAND } from '../AttentionMessagePlugin';
import { INSERT_DANGER_MESSAGE_COMMAND } from '../DangerMessagePlugin';

import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import { InsertTableDialog } from '../TablePlugin';
import FontSize from './fontSize';
import { Image } from '../../types';
import { InsertPreselectedImageDialog } from '../PreselectedImagePlugin';

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const blockTypeWithList = {
  ...blockTypeToBlockName,
  number: 'number',
  bullet: 'bullet',
  check: 'check',
};

type TBlockName = keyof typeof blockTypeToBlockName;

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}

function BlockFormatDropDown({
  editor,
  blockType = 'paragraph',
  // rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeWithList;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'icon block-type ' + blockType}
      buttonLabel={blockTypeWithList[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}
      >
        <i className="icon paragraph" />
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}
      >
        <i className="icon h1" />
        <span className="text">Heading 1</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}
      >
        <i className="icon h2" />
        <span className="text">Heading 2</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}
      >
        <i className="icon h3" />
        <span className="text">Heading 3</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}
      >
        <i className="icon bullet-list" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}
      >
        <i className="icon numbered-list" />
        <span className="text">Numbered List</span>
      </DropDownItem>
      {/* <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "check")}
        onClick={formatCheckList}
      >
        <i className="icon check-list" />
        <span className="text">Check List</span>
      </DropDownItem> */}
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}
      >
        <i className="icon quote" />
        <span className="text">Quote</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={style === 'font-family' ? 'icon block-type font-family' : ''}
      buttonAriaLabel={buttonAriaLabel}
    >
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(([option, text]) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${
            style === 'font-size' ? 'fontsize-item' : ''
          }`}
          onClick={() => handleClick(option)}
          key={option}
        >
          <span className="text">{text}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIconClassName={`icon ${isRTL ? formatOption.iconRTL : formatOption.icon}`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment"
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item"
      >
        <i className="icon left-align" />
        <span className="text">Left Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item"
      >
        <i className="icon center-align" />
        <span className="text">Center Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item"
      >
        <i className="icon right-align" />
        <span className="text">Right Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item"
      >
        <i className="icon justify-align" />
        <span className="text">Justify Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
        }}
        className="item"
      >
        <i
          className={`icon ${
            isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon
          }`}
        />
        <span className="text">Start Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
        }}
        className="item"
      >
        <i
          className={`icon ${
            isRTL ? ELEMENT_FORMAT_OPTIONS.end.iconRTL : ELEMENT_FORMAT_OPTIONS.end.icon
          }`}
        />
        <span className="text">End Align</span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item"
      >
        <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
        <span className="text">Outdent</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item"
      >
        <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
        <span className="text">Indent</span>
      </DropDownItem>
    </DropDown>
  );
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
  images,
  onSearchImages = () => {},
}: {
  images?: Image[];
  onSearchImages?: (value: string) => void;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<TBlockName | ListType>('paragraph');
  const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>('root');
  // const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
  //   null
  // );
  const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  // const [isStrikethrough, setIsStrikethrough] = useState(false);
  // const [isSubscript, setIsSubscript] = useState(false);
  // const [isSuperscript, setIsSuperscript] = useState(false);
  // const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      // setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType('table');
      } else {
        setRootType('root');
      }

      if (elementDOM !== null) {
        // setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type: ListType = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
      // Handle buttons
      setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '15px'));
      setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#000'));
      setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', '#fff'));
      setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'));
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left'
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl('https://');
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {}
      );
    },
    [activeEditor]
  );

  // const clearFormatting = useCallback(() => {
  //   activeEditor.update(() => {
  //     const selection = $getSelection();
  //     if ($isRangeSelection(selection)) {
  //       const anchor = selection.anchor;
  //       const focus = selection.focus;
  //       const nodes = selection.getNodes();
  //
  //       if (anchor.key === focus.key && anchor.offset === focus.offset) {
  //         return;
  //       }
  //
  //       nodes.forEach((node, idx) => {
  //         // We split the first and last node by the selection
  //         // So that we don't format unselected text inside those nodes
  //         if ($isTextNode(node)) {
  //           // Use a separate variable to ensure TS does not lose the refinement
  //           let textNode = node;
  //           if (idx === 0 && anchor.offset !== 0) {
  //             textNode = textNode.splitText(anchor.offset)[1] || textNode;
  //           }
  //           if (idx === nodes.length - 1) {
  //             textNode = textNode.splitText(focus.offset)[0] || textNode;
  //           }
  //
  //           if (textNode.__style !== "") {
  //             textNode.setStyle("");
  //           }
  //           if (textNode.__format !== 0) {
  //             textNode.setFormat(0);
  //             $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
  //           }
  //           node = textNode;
  //         } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
  //           node.replace($createParagraphNode(), true);
  //         } else if ($isDecoratorBlockNode(node)) {
  //           node.setFormat("");
  //         }
  //       });
  //     }
  //   });
  // }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  return (
    <div className="toolbar">
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
        type="button"
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title={IS_APPLE ? 'Redo (⌘Y)' : 'Redo (Ctrl+Y)'}
        type="button"
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={editor}
          />
          <Divider />
        </>
      )}
      <>
        <FontDropDown
          disabled={!isEditable}
          style={'font-family'}
          value={fontFamily}
          editor={editor}
        />
        <Divider />
        <FontSize
          selectionFontSize={fontSize.slice(0, -2)}
          editor={editor}
          disabled={!isEditable}
        />
        <Divider />
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
          title={IS_APPLE ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
          type="button"
          aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? '⌘B' : 'Ctrl+B'}`}
        >
          <i className="format bold" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
          className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
          title={IS_APPLE ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
          type="button"
          aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? '⌘I' : 'Ctrl+I'}`}
        >
          <i className="format italic" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
          className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
          title={IS_APPLE ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'}
          type="button"
          aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? '⌘U' : 'Ctrl+U'}`}
        >
          <i className="format underline" />
        </button>
        <button
          disabled={!isEditable}
          onClick={insertLink}
          className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
          aria-label="Insert link"
          title="Insert link"
          type="button"
        >
          <i className="format link" />
        </button>
        <DropdownColorPicker
          disabled={!isEditable}
          buttonClassName="toolbar-item color-picker"
          buttonAriaLabel="Formatting text color"
          buttonIconClassName="icon font-color"
          color={fontColor}
          onChange={onFontColorSelect}
          title="text color"
        />
        <DropdownColorPicker
          disabled={!isEditable}
          buttonClassName="toolbar-item color-picker"
          buttonAriaLabel="Formatting background color"
          buttonIconClassName="icon bg-color"
          color={bgColor}
          onChange={onBgColorSelect}
          title="bg color"
        />
        <Divider />
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item spaced"
          buttonLabel="Insert"
          buttonAriaLabel="Insert specialized editor node"
          buttonIconClassName="icon plus"
        >
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
            }}
            className="item"
          >
            <i className="icon horizontal-rule" />
            <span className="text">Horizontal Rule</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
            }}
            className="item"
          >
            <i className="icon page-break" />
            <span className="text">Page Break</span>
          </DropDownItem>
          {/*<DropDownItem*/}
          {/*  onClick={() => {*/}
          {/*    showModal('Insert Image', (onClose) => (*/}
          {/*      <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />*/}
          {/*    ));*/}
          {/*  }}*/}
          {/*  className="item"*/}
          {/*>*/}
          {/*  <i className="icon image" />*/}
          {/*  <span className="text">Image</span>*/}
          {/*</DropDownItem>*/}
          {/*<DropDownItem*/}
          {/*  onClick={() => {*/}
          {/*    showModal('Insert Inline Image', (onClose) => (*/}
          {/*      <InsertInlineImageDialog activeEditor={activeEditor} onClose={onClose} />*/}
          {/*    ));*/}
          {/*  }}*/}
          {/*  className="item"*/}
          {/*>*/}
          {/*  <i className="icon image" />*/}
          {/*  <span className="text">Inline Image</span>*/}
          {/*</DropDownItem>*/}
          {!!images && (
            <DropDownItem
              onClick={() => {
                showModal('Insert Preselect Image', (onClose) => (
                  <InsertPreselectedImageDialog
                    images={images}
                    activeEditor={activeEditor}
                    onClose={onClose}
                    onSearchImages={onSearchImages}
                  />
                ));
              }}
              className="item"
            >
              <i className="icon image" />
              <span className="text">Insert Preselect Image</span>
            </DropDownItem>
          )}

          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(INSERT_ATTENTION_MESSAGE_COMMAND, undefined);
            }}
            className="item"
          >
            <i className="icon attention-circle" />
            <span className="text">Add Attention Message</span>
          </DropDownItem>

          <DropDownItem
            onClick={() => {
              activeEditor.dispatchCommand(INSERT_DANGER_MESSAGE_COMMAND, undefined);
            }}
            className="item"
          >
            <i className="icon danger-triangle" />
            <span className="text">Add Danger Message</span>
          </DropDownItem>

          {/*<DropDownItem*/}
          {/*  onClick={() => {*/}
          {/*    activeEditor.dispatchCommand(INSERT_ATTENTION_MESSAGE, undefined);*/}
          {/*  }}*/}
          {/*  className="item"*/}
          {/*>*/}
          {/*  <i className="icon page-break" />*/}
          {/*  <span className="text">Add Important Message</span>*/}
          {/*</DropDownItem>*/}

          <DropDownItem
            onClick={() => {
              showModal('Insert Table', (onClose) => (
                <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
              ));
            }}
            className="item"
          >
            <i className="icon table" />
            <span className="text">Table</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              showModal('Insert Columns Layout', (onClose) => (
                <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
              ));
            }}
            className="item"
          >
            <i className="icon columns" />
            <span className="text">Columns Layout</span>
          </DropDownItem>
          <DropDownItem
            onClick={() => {
              editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
            }}
            className="item"
          >
            <i className="icon caret-right" />
            <span className="text">Collapsible container</span>
          </DropDownItem>
        </DropDown>
      </>
      <Divider />
      <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={editor}
        isRTL={isRTL}
      />

      {modal}
    </div>
  );
}
