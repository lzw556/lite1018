export type TreeNode = {
  id: string | number;
  children?: TreeNode[];
};

export function mapTree<I extends TreeNode, O>(
  nodeList: I[],
  fn: (node: I, path?: (string | number)[]) => O
): O[] {
  function inner(nodeList: I[], parent: (string | number)[]): O[] {
    return nodeList.map((node) => {
      const path = [...parent, node.id];
      if (node.children) {
        const sub = inner(node.children as I[], path);
        // return sub.length > 0 ? { ...fn(node, path), children: sub } : fn(node, path);
        return fn(sub.length > 0 ? { ...node, children: sub } : node, path);
      } else {
        return fn(node, path);
      }
    });
  }
  return inner(nodeList, []);
}

export function foreachTree<I extends TreeNode>(
  nodeList: I[],
  fn: (node: I, path?: (string | number)[]) => void
): void {
  mapTree(nodeList, (node, path) => {
    fn(node, path);
    return node;
  });
}

export function tree2List<I extends TreeNode, O extends I & { path?: (string | number)[] }>(
  nodeList: I[]
): O[] {
  const res: O[] = [];
  foreachTree(nodeList, (node, path) => {
    if (node.children) {
      delete node.children;
    }
    res.push({ ...node, path } as O);
  });
  return res;
}

export function list2Tree<I extends TreeNode & { parentId: string | number }, O extends TreeNode>(
  list: I[]
): O[] {
  const res: O[] = [];
  const fullMap = new Map<string | number, I>(list.map((item) => [item.id, item]));

  for (const node of list) {
    const parent = fullMap.get(node.parentId);
    if (parent) {
      if (!parent.children) {
        parent.children = [] as any;
      }
      parent.children!.push(node as any);
    } else {
      res.push(node as any);
    }
  }

  return res;
}

export function excludeTreeNode<N extends TreeNode>(
  nodeList: N[],
  fn: (node: N) => void,
  id?: string | number
): void {
  nodeList.forEach((node) => {
    if (node.id !== id) {
      fn(node);
      if (node.children && node.children.length > 0) {
        excludeTreeNode(node.children as N[], fn, id);
      }
    }
  });
}
