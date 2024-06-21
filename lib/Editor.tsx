/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import type { LexicalEditor } from 'lexical';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
// import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import type { EditorState } from 'lexical';

import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
import AttentionMessagePlugin from './plugins/AttentionMessagePlugin';
import DangerMessagePlugin from './plugins/DangerMessagePlugin';
import AutocompletePlugin from './plugins/AutocompletePlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CollapsiblePlugin from './plugins/CollapsiblePlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ContextMenuPlugin from './plugins/ContextMenuPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import EnterKeyPlugin from './plugins/EnterKeyPlugin';
import InsertTextPlugin from './plugins/InsertTextPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import KeywordsPlugin from './plugins/KeywordsPlugin';
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import PageBreakPlugin from './plugins/PageBreakPlugin';
import SetInitialValuePlugin from './plugins/SetInitialValuePlugin';

import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { Image } from './types';

import { DEFAULT_SETTINGS } from './appSettings';

import './index.css';

interface LastPosition {
  key: string;
}
export default function Editor({
  editable = true,
  initHtml,
  placeholderText = 'Enter some text...',
  pasteText,
  onUpdateText = () => {},
  onSearchImages = async () => [],
  onUploadImage = async () => '',
  onRemoveImage = async () => false,
  // comments = false,
  fileIO = false,
}: {
  editable?: boolean;
  initHtml?: string;
  placeholderText?: string;
  pasteText?: string;
  // comments?: boolean;
  fileIO?: boolean;
  onUpdateText?: (text: string) => void;
  onSearchImages?: (value: string) => Promise<Image[] | []>;
  onUploadImage?: (file: string) => Promise<string>;
  onRemoveImage?: (src: string) => Promise<boolean>;
}): JSX.Element {
  const { historyState } = useSharedHistoryContext();
  const {
    isOnlyPasteEditorMode,
    isAutocomplete,
    isMaxLength,
    isCharLimit,
    isCharLimitUtf8,
    isRichText,
    showTreeView,
    showTableOfContents,
    shouldUseLexicalContextMenu,
    tableCellMerge,
    tableCellBackgroundColor,
  } = DEFAULT_SETTINGS;

  const [editor] = useLexicalComposerContext();
  const [lastPosition, setLastPosition] = useState<LastPosition | undefined>(undefined);
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    editor.setEditable(editable);
  }, [editable, editor]);

  const placeholder = <Placeholder>{editable ? placeholderText : ''}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  function handleOnFocus(position: LastPosition) {
    setLastPosition(position);
  }

  const onChange = (editorState: EditorState, editor: LexicalEditor) => {
    editor.update(() => {
      const raw = $generateHtmlFromNodes(editor, null);
      setHtml(raw);
    });
  };

  useEffect(() => {
    onUpdateText(html);
  }, [html]);

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport = window.matchMedia('(max-width: 1025px)').matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);

    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <div className="editor-shell">
      {isRichText && editable && (
        <ToolbarPlugin onSearchImages={onSearchImages} setIsLinkEditMode={setIsLinkEditMode} />
      )}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !isRichText ? 'plain-text' : ''
        } ${!editable ? 'rounded-lg' : ''}`}
      >
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />

        {initHtml && <SetInitialValuePlugin initHtml={initHtml} />}
        <MentionsPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        <AttentionMessagePlugin />
        <DangerMessagePlugin />

        {/*{comments && <CommentPlugin providerFactory={undefined} />}*/}
        {
          <>
            {<HistoryPlugin externalHistoryState={historyState} />}
            <OnChangePlugin onChange={onChange} ignoreSelectionChange />
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {isOnlyPasteEditorMode && (
              <>
                <EnterKeyPlugin onFocus={handleOnFocus} />
                <InsertTextPlugin lastPosition={lastPosition} pasteText={pasteText} />
              </>
            )}
            {/* <MarkdownShortcutPlugin /> */}
            <ListPlugin />
            <PageBreakPlugin />
            {/* <CheckListPlugin /> */}
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <ImagesPlugin onUploadImage={onUploadImage} onRemoveImage={onRemoveImage} />
            <InlineImagePlugin onUploadImage={onUploadImage} onRemoveImage={onRemoveImage} />
            <LinkPlugin />
            {/* <YouTubePlugin /> */}
            {!editable && <LexicalClickableLinkPlugin />}
            <HorizontalRulePlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CollapsiblePlugin />
            <LayoutPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
          </>
        }
        {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin charset={isCharLimit ? 'UTF-16' : 'UTF-8'} maxLength={5} />
        )}
        {isAutocomplete && <AutocompletePlugin />}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        {editable && <ActionsPlugin supportFileIO={fileIO} />}
      </div>
      {showTreeView && <TreeViewPlugin />}
    </div>
  );
}
