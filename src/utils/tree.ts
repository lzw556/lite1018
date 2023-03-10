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
