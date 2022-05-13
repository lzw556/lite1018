package monitoringpointtype

const (
	MonitoringPointTypeGeneral = 1

	MonitoringPointTypeBoltAngle = 10001

	MonitoringPointTypePreload        = 10101
	MonitoringPointTypeDynamicPreload = 10102

	MonitoringPointTypeUnknown = 99999
)

var types = []Typer{
	BoltAngle{},
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
