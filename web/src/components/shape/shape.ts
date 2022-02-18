import G6 from '@antv/g6';
import {ColorHealth, ColorInfo, ColorWarn} from "../../constants/color";

const Color = require('color');

G6.registerNode('gateway', {
    drawShape: function drawShape(cfg: any, group: any) {
        let hexColor = ColorInfo;
        if (cfg.data.state) {
            hexColor = cfg.data.state.isOnline ? ColorHealth : ColorWarn;
        }
        const rect = group.addShape('rect', {
            attrs: {
                x: 0,
                y: 0,
                width: cfg.size[0],
                height: cfg.size[1],
                radius: 2,
                lineWidth: 1,
                stroke: hexColor,
                fill: Color(hexColor).lighten(0.5).hex(),
            }
        });
        group.addShape("text", {
            attrs: {
                x: 8,
                y: 8,
                fontSize: 10,
                text: cfg.data.name,
                textBaseline: "top",
                fill: "#fff",
            }
        })
        group.addShape("text", {
            attrs: {
                x: 8,
                y: 30,
                fontSize: 8,
                text: cfg.data.macAddress,
                textBaseline: "center",
                fill: "#fff",
            }
        })
        return rect;
    }
}, 'single-shape');