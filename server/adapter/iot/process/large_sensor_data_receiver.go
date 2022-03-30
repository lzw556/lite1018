package process

import (
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/sensor"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sort"
)

type LargeSensorDataReceiver struct {
	SessionID    int32            `json:"session_id"`
	Timestamp    uint64           `json:"timestamp"`
	SensorType   uint32           `json:"sensor_type"`
	MetaLength   int32            `json:"meta_length"`
	DataLength   uint32           `json:"data_length"`
	Packets      map[int32]Packet `json:"packets"`
	NumOfPackets int32            `json:"num_of_packets"`
}

func NewLargeSensorDataReceiver(m pd.LargeSensorDataMessage) LargeSensorDataReceiver {
	return LargeSensorDataReceiver{
		SessionID:    m.SessionId,
		Timestamp:    uint64(m.Timestamp),
		MetaLength:   m.MetaLength,
		DataLength:   uint32(m.DataLength),
		NumOfPackets: m.NumSegments,
	}
}

func (r *LargeSensorDataReceiver) Reset() {
	r.SessionID = 0
	r.Packets = make(map[int32]Packet)
	r.NumOfPackets = 0
}

func (r *LargeSensorDataReceiver) Receive(m pd.LargeSensorDataMessage) {
	r.Packets[m.SegmentId] = Packet{
		SeqID: m.SessionId,
		Data:  m.Data,
	}
	xlog.Debugf("received large sensor data => [packet size = %d, total size = %d]", len(r.Packets), m.NumSegments)
}

func (r LargeSensorDataReceiver) IsCompleted() bool {
	return int(r.NumOfPackets) == len(r.Packets)
}

func (r LargeSensorDataReceiver) SensorData(decoder sensor.RawDataDecoder) entity.SensorData {
	e := entity.SensorData{}
	return e
}

func (r LargeSensorDataReceiver) Bytes() []byte {
	packets := make(Packets, 0)
	for _, packet := range r.Packets {
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
