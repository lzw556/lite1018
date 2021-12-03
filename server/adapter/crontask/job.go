package crontask

type Job interface {
	ID() string
	Spec() string
	Run()
}
