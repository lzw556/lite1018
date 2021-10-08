package delayqueue

import (
	"fmt"
	"sync"
	"time"
)

const wheelSize = 3600

var once sync.Once

type Queue struct {
	timeWheel  [wheelSize]wheel
	currentIdx int
}

func New() *Queue {
	return &Queue{
		timeWheel:  [wheelSize]wheel{},
		currentIdx: 0,
	}
}

func (q *Queue) Start() {
	once.Do(q.start)
}

func (q *Queue) start() {
	go func() {
		for {
			select {
			case <-time.After(time.Second):
				if q.currentIdx >= wheelSize {
					q.currentIdx = q.currentIdx % wheelSize
				}
				taskLinkHead := q.timeWheel[q.currentIdx].Tasks
				current := taskLinkHead
				for current != nil {
					go current.Executor.Execute()
					current = current.Next
				}
				q.currentIdx++
			}
		}
	}()
}

func (q *Queue) AddExecutor(delay time.Duration, e Executor) error {
	diff := int(delay.Seconds())
	if diff <= 0 {
		return fmt.Errorf("time %v is before now", delay)
	}
	cycle := diff / wheelSize
	index := diff % wheelSize
	t := &Task{
		CycleCount: cycle,
		WheelPos:   index,
		Executor:   e,
	}
	if q.timeWheel[index].Tasks == nil {
		q.timeWheel[index].Tasks = t
	} else {
		head := q.timeWheel[index].Tasks
		t.Next = head
		q.timeWheel[index].Tasks = t
	}
	return nil
}
