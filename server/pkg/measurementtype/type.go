package measurementtype

type Type uint

const (
	BoltLoosening Type = iota + 1
	BoltElongation
	NormalTemperatureCorrosion
	HighTemperatureCorrosion
	PressureTemperature
	FlangeLoosening
	FlangeElongation
	Vibration
	AngleDip
	TowerDisplacement
	TowerSettlement
)
