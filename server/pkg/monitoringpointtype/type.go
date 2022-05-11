package monitoringpointtype

const (
	MonitoringPointTypeGeneral = iota + 1

	MonitoringPointTypeBoltAngle = iota + 10001

	MonitoringPointTypePreload = iota + 10101
	MonitoringPointTypeDynamicPreload

	MonitoringPointTypeUnknown = iota + 99999
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
