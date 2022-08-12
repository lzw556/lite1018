package process

import (
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/process/receiver"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/sensor"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sync"
	"time"
)

type LargeSensorData struct {
	repository dependency.SensorDataRepository
	mu         sync.RWMutex
}

func NewLargeSensorData() Processor {
	return newRoot(&LargeSensorData{
		repository: repository.SensorData{},
		mu:         sync.RWMutex{},
	})
}

func (p *LargeSensorData) Name() string {
	return "LargeSensorData"
}

func (p *LargeSensorData) Next() Processor {
	return nil
}

func (p *LargeSensorData) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		device := value.(entity.Device)
		m := pd.LargeSensorDataMessage{}
		if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
			return fmt.Errorf("unmarshal [LargeSensorData] message failed: %v", err)
		}
		key := fmt.Sprintf("%s-%d", device.MacAddress, m.SessionId)
		if receiver.Receive(key, m); receiver.IsCompleted(key, int(m.NumSegments)) {
			packets := receiver.Get(key)
			if e, err := p.decodeToSensorData(flatPackets(packets), packets[0].MetaLength); err == nil {
				e.MacAddress = device.MacAddress
				if err := p.repository.Create(e); err != nil {
					return fmt.Errorf("create large sensor data failed: %v", err)
				}
				xlog.Infof("[%s] insert ok large sensor data: %+v", msg.Body.Device, e)
			}
			receiver.Clear(key)
		}
		cmd := command.NewLargeSensorDataAckCommand(m.SessionId, m.SegmentId)
		err := cmd.ExecuteAsync(msg.Body.Gateway, msg.Body.Device, false)
		if err != nil {
			xlog.Errorf("[%s] send [%s] command failed: %v", msg.Body.Device, cmd.Name(), err)
			return err
		}
	}
	return nil
}

func flatPackets(packets map[int32]pd.LargeSensorDataMessage) []byte {
	data := make([]byte, 0)
	for i := 0; i < len(packets); i++ {
		data = append(data, packets[int32(i)].Data...)
	}
	return data
}

func (p *LargeSensorData) decodeToSensorData(data []byte, metaLength int32) (entity.SensorData, error) {
	var (
		sensorType = binary.LittleEndian.Uint32(data[8:12])
		timestamp  = binary.LittleEndian.Uint64(data[:8])
	)

	e := entity.SensorData{
		Time:       time.UnixMilli(int64(timestamp)),
		SensorType: uint(sensorType),
	}

	var decoder sensor.RawDataDecoder
	xlog.Debugf("sensor type: %d", sensorType)
	switch sensorType {
	case devicetype.KxSensor, devicetype.AdvancedKxSensor:
		decoder = sensor.NewKx122Decoder()
	case devicetype.DynamicLengthAttitudeSensor:
		decoder = sensor.NewDynamicLengthAttitudeDecoder()
	case devicetype.DynamicSCL3300Sensor:
		decoder = sensor.NewDynamicInclinationDecoder()
	default:
		return entity.SensorData{}, fmt.Errorf("raw data decoder is nil")
	}
	values, err := decoder.Decode(data[16:], int(metaLength-16))
	e.Values = values
	return e, err
}
