package monitoringpointtype

const (
	MonitoringPointTypeGeneral = 1

	MonitoringPointTypeBoltAngle = 10101 //角度

	MonitoringPointTypeThickness = 10201 // 厚度

	MonitoringPointTypePreload        = 10301 // 预紧力
	MonitoringPointTypeDynamicPreload = 10302 // 动态预紧力

	MonitoringPointTypeVibration = 10401 // 振动

	MonitoringPointTypeInclinometer        = 10501 // 倾角
	MonitoringPointTypeDynamicInclinometer = 10502 // 动态倾角

	MonitoringPointTypePressure = 10601 // 压力

	MonitoringPointTypeCurrent = 10701 // 电流

	MonitoringPointTypeUnknown = 99999
)

const (
	MonitoringPointCategoryBasic = 1
	MonitoringPointCategoryRaw   = 2
)

var types = []Typer{
	BoltAngle{},
	Preload{},
	DynamicPreload{},
}

type Typer interface {
	ID() uint
	Properties() []Property
}

func Get(id uint) Typer {
	for _, t := range types {
		if t.ID() == id {
			return t
		}
	}
	return nil
}
