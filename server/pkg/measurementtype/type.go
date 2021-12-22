package measurementtype

type Type uint

const (
	BoltLoosening Type = iota + 1
	BoltElongation
	CorrosionThickness
	Pressure
	FlangeLoosening
	FlangeElongation
	Vibration
	AngleDip
	TowerDisplacement
	TowerSettlement
)
