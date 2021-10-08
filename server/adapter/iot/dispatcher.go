package iot

type Dispatcher interface {
	Name() string
	Dispatch(msg Message)
}
