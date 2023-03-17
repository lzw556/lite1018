import { cloneDeep } from 'lodash';
import { MonitoringPointRow } from '../views/monitoring-point';

export type TreeNode = {
  children?: TreeNode[];
};

export function dfsTransformTree<Input extends TreeNode, Output extends TreeNode>(
  tree: Input[],
  fn: (node: Input) => Output
): Output[] {
  return tree.map((node) => {
    const newNode = fn(node);
    if (newNode.children && newNode.children.length > 0) {
      return {
        ...newNode,
        children: dfsTransformTree(newNode.children as Input[], fn)
      };
    } else {
      return newNode;
    }
  });
}

export type Node = {
  id: number;
  name: string;
  parentId: number;
  children?: Node[];
  type?: number;
  monitoringPoints?: MonitoringPointRow[];
};
export function filterEmptyChildren<T extends Node>(nodes: T[]) {
  if (nodes.length === 0) return [];
  const copy = cloneDeep(nodes);
  return copy.map((node) =>
    mapTreeNode(node, (node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
        return node;
      } else {
        return node;
      }
    })
  );
}

export function mapTreeNode<N extends Node>(node: N, fn: <N extends Node>(node: N) => N): N {
  const newNode = fn(node);
  if (newNode.children && newNode.children.length > 0) {
    return {
      ...newNode,
      children: newNode.children.map((node) => mapTreeNode(node, fn))
    };
  } else {
    return newNode;
  }
}

export function forEachTreeNode<N extends Node>(
  node: N,
  fn: <N extends Node>(node: N) => void
): void {
  fn(node);
  if (node.children && node.children.length > 0) {
    node.children.map((node) => forEachTreeNode(node, fn));
  }
}
