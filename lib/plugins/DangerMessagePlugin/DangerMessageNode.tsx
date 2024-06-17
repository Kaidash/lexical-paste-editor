import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
} from 'lexical';

import './index.css';

type SerializedDangerMessageNode = SerializedElementNode;

export function $convertCollapsibleContentElement(): DOMConversionOutput | null {
  const node = $createDangerMessageNode();
  return { node };
}

export class DangerMessageNode extends ElementNode {
  static getType(): string {
    return 'danger-message';
  }

  static clone(node: DangerMessageNode): DangerMessageNode {
    return new DangerMessageNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.classList.add('DangerMessage__wrapper');
    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-danger-message')) {
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
    element.classList.add('DangerMessage__wrapper');
    element.setAttribute('data-lexical-danger-message', 'true');
    return { element };
  }

  static importJSON(): DangerMessageNode {
    return $createDangerMessageNode();
  }

  exportJSON(): SerializedDangerMessageNode {
    return {
      ...super.exportJSON(),
      type: 'danger-message',
      version: 1,
    };
  }
}

export function $createDangerMessageNode(): DangerMessageNode {
  return new DangerMessageNode();
}

export function $isDangerMessageNode(
  node: LexicalNode | null | undefined
): node is DangerMessageNode {
  return node instanceof DangerMessageNode;
}
