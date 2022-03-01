package process

import (
	"bytes"
	"encoding/binary"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"sort"
)

type LargeSensorDataReceiver struct {
	Timestamp     uint64  `json:"timestamp"`
	SensorType    uint32  `json:"sensor_type"`
	MetaLength    int32   `json:"meta_length"`
	DataLength    uint32  `json:"data_length"`
	Packets       Packets `json:"packets"`
	ReceiveLength int     `json:"receive_length"`
}

func NewLargeSensorDataReceiver(m pd.LargeSensorDataMessage) LargeSensorDataReceiver {
	r := LargeSensorDataReceiver{
		MetaLength: m.MetaLength,
	}
	_ = binary.Read(bytes.NewBuffer(m.Data[:8]), binary.LittleEndian, &r.Timestamp)
	_ = binary.Read(bytes.NewBuffer(m.Data[8:12]), binary.LittleEndian, &r.SensorType)
	_ = binary.Read(bytes.NewBuffer(m.Data[12:16]), binary.LittleEndian, &r.DataLength)
	r.Packets = Packets{
		{
			SeqID: 0,
			Data:  m.Data,
		},
	}
	r.ReceiveLength = len(m.Data)
	xlog.Debugf("start receive large sensor data => [%d]", r.Timestamp)
	return r
}

func (r *LargeSensorDataReceiver) Receive(seqID int32, data []byte) {
	r.Packets = append(r.Packets, Packet{
		SeqID: seqID,
		Data:  data,
	})
	r.ReceiveLength += len(data)
	xlog.Debugf(
		"receive large sensor data => [packet len = %d, receive len = %d, data len = %d, seqId= %d]",
		len(data), r.ReceiveLength, r.DataLength, seqID)
}

func (r LargeSensorDataReceiver) IsCompleted() bool {
	return r.DataLength == uint32(r.ReceiveLength-int(r.MetaLength))
}

func (r LargeSensorDataReceiver) Bytes() []byte {
	sort.Sort(r.Packets)
	data := make([]byte, 0)
	for i := range r.Packets {
		data = append(data, r.Packets[i].Data...)
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
