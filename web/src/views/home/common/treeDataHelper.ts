import { cloneDeep } from "lodash";
import { MeasurementRow } from "../summary/measurement/props";

export type Node = {
  id: number;
  name: string;
  parentId: number;
  children?: Node[];
  type?: number;
  monitoringPoints?: MeasurementRow[];
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

export function forEachTreeNode<N extends Node>(node: N, fn: <N extends Node>(node: N) => void): void {
  fn(node);
  if (node.children && node.children.length > 0) {
    node.children.map((node) => forEachTreeNode(node, fn));
  }
}