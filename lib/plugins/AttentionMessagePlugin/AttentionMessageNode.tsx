import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
} from 'lexical';

import './index.css';

type SerializedAttentionMessageNode = SerializedElementNode;

export function $convertCollapsibleContentElement(): DOMConversionOutput | null {
  const node = $createAttentionMessageNode();
  return { node };
}

export class AttentionMessageNode extends ElementNode {
  static getType(): string {
    return 'attention-message';
  }

  static clone(node: AttentionMessageNode): AttentionMessageNode {
    return new AttentionMessageNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.classList.add('AttentionMessage__wrapper');
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-attention-message')) {
          return null;
        }
        return {
          conversion: $convertCollapsibleContentElement,
          priority: 2,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.classList.add('AttentionMessage__wrapper');
    element.setAttribute('data-lexical-attention-message', 'true');
    return { element };
  }

  static importJSON(): AttentionMessageNode {
    return $createAttentionMessageNode();
  }

  exportJSON(): SerializedAttentionMessageNode {
    return {
      ...super.exportJSON(),
      type: 'attention-message',
      version: 1,
    };
  }
}

export function $createAttentionMessageNode(): AttentionMessageNode {
  return new AttentionMessageNode();
}

export function $isAttentionMessageNode(
  node: LexicalNode | null | undefined
): node is AttentionMessageNode {
  return node instanceof AttentionMessageNode;
}
