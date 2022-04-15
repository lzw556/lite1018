package process

import (
	"bytes"
	"encoding/binary"
	"fmt"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/sensor"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sort"
	"time"
)

type LargeSensorDataReceiver struct {
	SessionID    int32            `json:"session_id"`
	MetaLength   int32            `json:"meta_length"`
	DataLength   uint32           `json:"data_length"`
	Packets      map[int32]Packet `json:"packets"`
	NumOfPackets int32            `json:"num_of_packets"`
}

func NewLargeSensorDataReceiver(m pd.LargeSensorDataMessage) LargeSensorDataReceiver {
	return LargeSensorDataReceiver{
		SessionID:    m.SessionId,
		MetaLength:   m.MetaLength,
		DataLength:   uint32(m.DataLength),
		NumOfPackets: m.NumSegments,
		Packets:      map[int32]Packet{},
	}
}

func (r *LargeSensorDataReceiver) Reset(m pd.LargeSensorDataMessage) {
	r.SessionID = m.SessionId
	r.Packets = map[int32]Packet{}
	r.NumOfPackets = m.NumSegments
	r.MetaLength = m.MetaLength
	r.DataLength = uint32(m.DataLength)
}

func (r *LargeSensorDataReceiver) Receive(m pd.LargeSensorDataMessage) {
	r.Packets[m.SegmentId] = Packet{
		SeqID: m.SegmentId,
		Data:  m.Data,
	}
	xlog.Debugf("received large sensor data => [packet size = %d, total size = %d]", len(r.Packets), m.NumSegments)
}

func (r LargeSensorDataReceiver) IsCompleted() bool {
	return int(r.NumOfPackets) == len(r.Packets)
}

func (r LargeSensorDataReceiver) SensorData() (entity.SensorData, error) {
	var (
		data = r.flatPackets()

		sensorType uint32
		timestamp  uint64
		dataLength uint32
	)

	_ = binary.Read(bytes.NewBuffer(data[:8]), binary.LittleEndian, &timestamp)
	_ = binary.Read(bytes.NewBuffer(data[8:12]), binary.LittleEndian, &sensorType)
	_ = binary.Read(bytes.NewBuffer(data[12:16]), binary.LittleEndian, &dataLength)
	e := entity.SensorData{
		Time:       time.UnixMilli(int64(timestamp)),
		SensorType: uint(sensorType),
	}

	var decoder sensor.RawDataDecoder
	xlog.Debugf("sensor type: %d", sensorType)
	switch sensorType {
	case devicetype.KxSensor:
		decoder = sensor.NewKx122Decoder()
	case devicetype.DynamicLengthAttitudeSensor:
		decoder = sensor.NewDynamicLengthAttitudeDecoder()
	case devicetype.DynamicSCL3300Sensor:
		decoder = sensor.NewDynamicInclinationDecoder()
	default:
		return entity.SensorData{}, fmt.Errorf("raw data decoder is nil")
	}
	values, err := decoder.Decode(data[16:])
	e.Values = values
	xlog.Debugf("received sensor data time: => [%v]", time.UnixMilli(int64(timestamp)))
	return e, err
}

func (r LargeSensorDataReceiver) flatPackets() []byte {
	packets := make(Packets, 0)
	for _, packet := range r.Packets {
		xlog.Debugf("packet segmentId: %d", packet.SeqID)
		packets = append(packets, packet)
	}
	sort.Sort(packets)
	data := make([]byte, 0)
	for i := range packets {
		data = append(data, packets[i].Data...)
	}
	return data
}

type Packet struct {
	SeqID int32  `json:"seq_id"`
	Data  []byte `json:"data"`
}

type Packets []Packet

func (ps Packets) Len() int {
	return len(ps)
}

func (ps Packets) Less(i, j int) bool {
	return ps[i].SeqID < ps[j].SeqID
}

func (ps Packets) Swap(i, j int) {
	ps[i], ps[j] = ps[j], ps[i]
}
