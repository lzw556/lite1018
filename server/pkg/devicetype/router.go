package devicetype

type Router struct{}

func (Router) ID() uint {
	return RouterType
}

func (Router) SensorID() uint {
	return 0
}

func (Router) Settings() Settings {
	return []Setting{}
}

func (Router) Properties(sensorID uint) Properties {
	return nil
}
