package measurement

type Type uint

const (
	BoltLooseningMeasurementType Type = iota + 1
	BoltElongationMeasurementType
	CorrosionThicknessMeasurementType
	PressureMeasurementType
	FlangeLooseningMeasurementType
	FlangeElongationMeasurementType
	VibrationMeasurementType
	AngleDipMeasurementType
	TowerDisplacementMeasurementType
	TowerSettlementMeasurementType
)
