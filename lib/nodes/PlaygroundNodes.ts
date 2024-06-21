/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Klass, LexicalNode } from 'lexical';

import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { AutocompleteNode } from './AutocompleteNode';
import { AttentionMessageNode } from '../plugins/AttentionMessagePlugin/AttentionMessageNode.tsx';
import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode';
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode';
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode';
import { DangerMessageNode } from '../plugins/DangerMessagePlugin/DangerMessageNode.tsx';
import { ImageNode } from './ImageNode';
import { InlineImageNode } from './InlineImageNode';
import { KeywordNode } from './KeywordNode';
import { LayoutContainerNode } from './LayoutContainerNode';
import { LayoutItemNode } from './LayoutItemNode';
import { MentionNode } from './MentionNode';
import { PageBreakNode } from './PageBreakNode';
import { YouTubeNode } from './YouTubeNode';

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  AttentionMessageNode,
  DangerMessageNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  InlineImageNode,
  ImageNode,
  MentionNode,
  AutocompleteNode,
  KeywordNode,
  HorizontalRuleNode,
  YouTubeNode,
  PageBreakNode,
  MarkNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  LayoutContainerNode,
  LayoutItemNode,
];

export default PlaygroundNodes;
