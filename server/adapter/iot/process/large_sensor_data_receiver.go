package process

import (
	"bytes"
	"encoding/binary"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sort"
)

type LargeSensorDataReceiver struct {
	SessionID     int32            `json:"session_id"`
	Timestamp     uint64           `json:"timestamp"`
	SensorType    uint32           `json:"sensor_type"`
	MetaLength    int32            `json:"meta_length"`
	DataLength    uint32           `json:"data_length"`
	Packets       map[int32]Packet `json:"packets"`
	ReceiveLength int              `json:"receive_length"`
}

func NewLargeSensorDataReceiver(m pd.LargeSensorDataMessage) LargeSensorDataReceiver {
	r := LargeSensorDataReceiver{
		SessionID:     m.SessionId,
		ReceiveLength: len(m.Data),
	}
	r.Packets = map[int32]Packet{
		m.SeqId: {
			SeqID: m.SeqId,
			Data:  m.Data,
		},
	}
	//_ = binary.Read(bytes.NewBuffer(m.Data[:8]), binary.LittleEndian, &r.Timestamp)
	//_ = binary.Read(bytes.NewBuffer(m.Data[8:12]), binary.LittleEndian, &r.SensorType)
	//_ = binary.Read(bytes.NewBuffer(m.Data[12:16]), binary.LittleEndian, &r.DataLength)
	//r.Packets = Packets{
	//	{
	//		SeqID: 0,
	//		Data:  m.Data,
	//	},
	//}
	//r.ReceiveLength = len(m.Data)
	//xlog.Debugf("start receive large sensor data => [%d]", r.Timestamp)
	return r
}

func (r *LargeSensorDataReceiver) Receive(m pd.LargeSensorDataMessage) {
	r.Packets[m.SeqId] = Packet{
		SeqID: m.SeqId,
		Data:  m.Data,
	}
	r.ReceiveLength += len(m.Data)
	if m.SeqId == 0 {
		r.MetaLength = m.MetaLength
		r.Timestamp = uint64(m.Timestamp)
		_ = binary.Read(bytes.NewBuffer(m.Data[:8]), binary.LittleEndian, &r.Timestamp)
		_ = binary.Read(bytes.NewBuffer(m.Data[8:12]), binary.LittleEndian, &r.SensorType)
		_ = binary.Read(bytes.NewBuffer(m.Data[12:16]), binary.LittleEndian, &r.DataLength)
	}
	xlog.Debugf(
		"receive large sensor data => [packet len = %d, receive len = %d, data len = %d, seqId= %d]",
		m.DataLength, r.ReceiveLength, r.DataLength, m.SeqId)
}

func (r LargeSensorDataReceiver) IsCompleted() bool {
	return r.DataLength == uint32(r.ReceiveLength-int(r.MetaLength))
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
