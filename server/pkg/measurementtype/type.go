package measurementtype

const (
	BoltLooseningType uint = iota + 1
	BoltElongationType
	NormalTemperatureCorrosionType
	HighTemperatureCorrosionType
	PressureTemperatureType
	FlangeLooseningType
	FlangeElongationType
	Vibration3AxisType
	AngleDipType
	TowerDisplacementType
	TowerSettlementType
)

type Typer interface {
	ID() uint
	Variables() Variables
}

var types = []Typer{
	BoltLoosening{},
	BoltElongation{},
	NormalTemperatureCorrosion{},
	Vibration3Axis{},
	AngleDip{},
	FlangeElongation{},
}

func Get(id uint) Typer {
	for _, t := range types {
		if t.ID() == id {
			return t
		}
	}
	return nil
}
