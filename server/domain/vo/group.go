package vo

type Group struct {
	ID      uint     `json:"id"`
	Name    string   `json:"name"`
	Devices []Device `json:"devices"`
}

func NewGroup(id uint, name string) Group {
	return Group{
		ID:   id,
		Name: name,
	}
}

func (g *Group) AddDevices(es ...Device) {
	g.Devices = es
}
