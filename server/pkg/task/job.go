package task

type Job interface {
	ID() string
	Spec() string
	Run()
}
