package measurement

import "github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"

type Parameter struct {
	Name  string `json:"name"`
	Label string `json:"label"`
}

func GetParameters(id Type) ([]Parameter, error) {
	switch id {
	case BoltLooseningMeasurementType, BoltElongationMeasurementType,
		AngleDipMeasurementType, CorrosionThicknessMeasurementType,
		PressureMeasurementType, VibrationMeasurementType:
		return nil, nil
	case FlangeElongationMeasurementType, FlangeLooseningMeasurementType:
		return []Parameter{
			{Name: "number_of_bolts", Label: "螺栓数量"},
		}, nil
	case TowerDisplacementMeasurementType:
		return []Parameter{
			{Name: "height_of_tower", Label: "塔筒高度"},
		}, nil
	default:
		return nil, errcode.UnknownMeasurementTypeError
	}
}
