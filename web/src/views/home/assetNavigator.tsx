import { Breadcrumb } from 'antd';
import React from 'react';

export const AssetNavigator = () => {
  type Node = { id: number; name: string; parentId: number; children?: Node[] };
  const node: Node = {
    id: 1,
    name: '总览',
    parentId: -1,
    children: [
      { id: 2, name: '1号风机', parentId: 1, children: [{ id: 3, name: '1号叶根', parentId: 2 }] },
      {
        id: 4,
        name: '2号风机',
        parentId: 1,
        children: [
          {
            id: 5,
            name: '1号叶根',
            parentId: 4,
            children: [
              { id: 8, name: '1号螺栓', parentId: 5 },
              { id: 9, name: '2号螺栓', parentId: 5 }
            ]
          },
          { id: 6, name: '2号叶根', parentId: 4 },
          { id: 7, name: '3号叶根', parentId: 4 }
        ]
      }
    ]
  };

  const expand = (array: Node[][], node: Node) => {
    if (node.children) {
      array.push([...node.children]);
      let _arr: Node[] = [];
      node.children.forEach((node) => {
        if (node.children) _arr.push(...node.children);
      });
      if (_arr.length > 0) array.push([..._arr]);
      _arr.forEach((node) => expand(array, node));
    }
  };
  const jj: Node[][] = [];
  expand(jj, node);
  console.log(jj);
  return (
    <Breadcrumb>
      <Breadcrumb.Item>总览</Breadcrumb.Item>
    </Breadcrumb>
  );
};
