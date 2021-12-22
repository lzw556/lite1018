package vo

import "github.com/thetasensors/theta-cloud-lite/server/domain/po"

type Display struct {
	Location Point `json:"location"`
}

func NewDisplay(e po.Display) Display {
	return Display{
		Location: Point{
			X: e.Location.X,
			Y: e.Location.Y,
		},
	}
}

type Point struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}
