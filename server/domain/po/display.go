package po

type Display struct {
	Image string `json:"image"`
	Point Point  `json:"point"`
}

type Point struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}
