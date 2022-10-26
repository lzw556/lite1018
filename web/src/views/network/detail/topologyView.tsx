import G6 from '@antv/g6';
import { FC, useEffect } from 'react';
import { Network } from '../../../types/network';
import { Device } from '../../../types/device';
import '../../../components/shape/shape';

export interface TopologyViewProps {
  network: Network;
}

const TopologyView: FC<TopologyViewProps> = ({ network }) => {
  let graph: any = null;

  const tree: any = (root: Device) => {
    console.log(network.nodes);
    return network.nodes
      .filter((device) => device.macAddress !== device.parent)
      .filter((device) => device.parent === root.macAddress)
      .map((device) => {
        return {
          id: device.macAddress,
          data: device,
          children: tree(device)
        };
      });
  };

  useEffect(() => {
    if (!graph) {
      graph = new G6.TreeGraph({
        container: 'container',
        width: document.querySelector('#container')?.clientWidth,
        height: document.querySelector('#container')?.clientHeight,
        modes: {
          default: [{ type: 'collapse-expand' }, 'drag-canvas', 'zoom-canvas']
        },
        defaultNode: {
          type: 'gateway',
          size: [120, 40],
          anchorPoints: [
            [0, 0.5],
            [1, 0.5]
          ]
        },
        defaultEdge: {
          type: 'cubic-horizontal',
          style: {
            stroke: '#A3B1BF'
          }
        },
        layout: {
          type: 'compactBox',
          direction: 'LR',
          getId: function getId(d: any) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 16;
          },
          getWidth: function getWidth() {
            return 16;
          },
          getVGap: function getVGap() {
            return 20;
          },
          getHGap: function getHGap() {
            return 80;
          }
        }
      });
      graph.data({
        id: network.gateway.macAddress,
        data: network.gateway,
        children: tree(network.gateway)
      });
      graph.render();
      graph.fitView();
    }
  }, []);

  return <div id={'container'} style={{ width: '100%', height: '100%' }} />;
};

export default TopologyView;
