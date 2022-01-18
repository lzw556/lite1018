package measurementtype

import "fmt"

var ErrVariableNotFound = fmt.Errorf("variable not found")

type VariableType uint

const (
	FloatVariableType VariableType = iota + 1
	ArrayVariableType
	AxisVariableType
)

type Variable struct {
	DataIndex int          `json:"dataIndex"`
	Name      string       `json:"name"`
	Title     string       `json:"title"`
	Unit      string       `json:"unit"`
	Precision int          `json:"precision"`
	Type      VariableType `json:"type"`
	Primary   bool         `json:"primary"`
	Sort      int          `json:"sort"`
}

type Variables []Variable

func (vs Variables) GetByName(name string) (Variable, error) {
	for _, v := range vs {
		if v.Name == name {
			return v, nil
		}
	}
	return Variable{}, ErrVariableNotFound
}

func (vs Variables) Convert(f func(variable Variable) interface{}) map[string]interface{} {
	fields := make(map[string]interface{})
	for _, v := range vs {
		fields[v.Name] = f(v)
	}
	return fields
}
