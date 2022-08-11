package process

import (
	"encoding/binary"
	"fmt"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/sensor"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type LargeSensorDataReceiver struct {
	MacAddress   string           `json:"mac_address"`
	SessionID    int32            `json:"session_id"`
	MetaLength   int32            `json:"meta_length"`
	DataLength   uint32           `json:"data_length"`
	Packets      map[int32]Packet `json:"packets"`
	NumOfPackets int32            `json:"num_of_packets"`
}

func NewLargeSensorDataReceiver(mac string, m pd.LargeSensorDataMessage) LargeSensorDataReceiver {
	return LargeSensorDataReceiver{
		MacAddress:   mac,
		SessionID:    m.SessionId,
		MetaLength:   m.MetaLength,
		DataLength:   uint32(m.DataLength),
		NumOfPackets: m.NumSegments,
		Packets:      map[int32]Packet{},
	}
}

func (r *LargeSensorDataReceiver) Reset(mac string, m pd.LargeSensorDataMessage) {
	r.MacAddress = mac
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
	if m.SegmentId == 0 {
		xlog.Debugf("[%s] received meta length [%d]", r.MacAddress, m.MetaLength)
		r.MetaLength = m.MetaLength
	}
	xlog.Debugf("[%s] received large sensor data segment id [%d]", r.MacAddress, m.SegmentId)
}

func (r LargeSensorDataReceiver) IsCompleted() bool {
	xlog.Debugf("[%s] received large sensor data => [packet size = %d, total size = %d]", r.MacAddress, len(r.Packets), r.NumOfPackets)
	return int(r.NumOfPackets) == len(r.Packets)
}

func (r LargeSensorDataReceiver) SensorData() (entity.SensorData, error) {
	var (
		data = r.flatPackets()

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
	values, err := decoder.Decode(data[16:], int(r.MetaLength-16))
	e.Values = values
	return e, err
}

func (r LargeSensorDataReceiver) flatPackets() []byte {
	data := make([]byte, 0)
	for i := 0; i < len(r.Packets); i++ {
		data = append(data, r.Packets[int32(i)].Data...)
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
