package process

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type Processor interface {
	Name() string
	Next() Processor
	Process(ctx *iot.Context, msg iot.Message) error
}

func Do(ctx *iot.Context, processor Processor, msg iot.Message) {
	for processor != nil {
		if err := processor.Process(ctx, msg); err != nil {
			xlog.Errorf("process [%s] Processor failed: %v", processor.Name(), err)
			return
		}
		processor = processor.Next()
	}
}
