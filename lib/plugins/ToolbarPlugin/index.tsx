/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode, ListType } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $isHeadingNode } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from '@lexical/selection';
import { $isTableNode } from '@lexical/table';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useState } from 'react';

import { IS_APPLE } from '../../shared';

import useModal from '../../hooks/useModal';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import { InsertTableDialog } from '../TablePlugin';
import BlockFormatDropDown from './BlockFormatDropDown.tsx';
import ElementFormatDropdown from './ElementFormatDropdown.tsx';
import FontSize from './fontSize';
import { InsertPreselectedImageDialog } from '../PreselectedImagePlugin';
import FontDropDown from './FontDropDown.tsx';
import Divider from './Divider.tsx';

import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import { INSERT_PAGE_BREAK } from '../PageBreakPlugin';
import { INSERT_ATTENTION_MESSAGE_COMMAND } from '../AttentionMessagePlugin';
import { INSERT_DANGER_MESSAGE_COMMAND } from '../DangerMessagePlugin';

import { rootTypeToRootName, blockTypeToBlockName } from './constants.ts';
import { TBlockName } from './types.ts';
import { Image } from '../../types';

export default function ToolbarPlugin({
  setIsLinkEditMode,
  onSearchImages = async () => [],
}: {
  onSearchImages?: (value: string) => Promise<Image[] | []>;
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

  const showPreselectedImageModal = useCallback(() => {
    showModal('Insert Preselect Image', (onClose) => (
      <InsertPreselectedImageDialog
        activeEditor={activeEditor}
        onSearchImages={onSearchImages}
        onClose={onClose}
      />
    ));
  }, [activeEditor, onSearchImages]);

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

          {/*<DropdownInsertPreselectedImage*/}
          {/*  title="Test"*/}
          {/*  images={images}*/}
          {/*  activeEditor={activeEditor}*/}
          {/*  onSearchImages={onSearchImages}*/}
          {/*/>*/}

          <DropDownItem onClick={showPreselectedImageModal} className="item">
            <i className="icon image" />
            <span className="text">Insert Preselect Image</span>
          </DropDownItem>

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
