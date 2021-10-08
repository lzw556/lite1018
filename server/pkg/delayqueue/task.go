package delayqueue

type Task struct {
	CycleCount int
	WheelPos   int
	Executor   Executor
	Next       *Task
}
