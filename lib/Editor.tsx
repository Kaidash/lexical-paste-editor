/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
// import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useEffect, useState } from 'react';

import { useSharedHistoryContext } from './context/SharedHistoryContext';
import ActionsPlugin from './plugins/ActionsPlugin';
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

import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DEFAULT_SETTINGS } from './appSettings';

import './index.css';


interface LastPosition {
  key: string;
}

export default function Editor({
  editable = true,
  startingState,
  placeholderText = 'Enter some text...',
  pasteText,
  // comments = false,
  fileIO = false,
}: {
  editable?: boolean;
  startingState?: string;
  placeholderText?: string;
  pasteText?: string;
  // comments?: boolean;
  fileIO?: boolean;
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

  useEffect(() => {
    editor.setEditable(editable);
    console.log(editor);
  }, [editable, editor]);
  useEffect(() => {}, [startingState, editor]);

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
      {isRichText && editable && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />}
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

        <MentionsPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin />
        <AutoLinkPlugin />
        {/*{comments && <CommentPlugin providerFactory={undefined} />}*/}
        {
          <>
            {<HistoryPlugin externalHistoryState={historyState} />}
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
            <ImagesPlugin />
            <InlineImagePlugin />
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
