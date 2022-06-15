package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/thetasensors/theta-cloud-lite/server/worker"
	"sync"
	"time"
)

type LinkStatus struct {
	deviceRepo           dependency.DeviceRepository
	eventRepo            dependency.EventRepository
	deviceLinkStatusRepo dependency.DeviceLinkStatusRepository
}

func NewLinkStatus() Processor {
	return newRoot(LinkStatus{
		deviceRepo:           repository.Device{},
		eventRepo:            repository.Event{},
		deviceLinkStatusRepo: repository.DeviceLinkStatus{},
	})
}

func (p LinkStatus) Name() string {
	return "LinkStatus"
}

func (p LinkStatus) Next() Processor {
	return nil
}

func (p LinkStatus) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.LinkStatusMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [LinkStatus] message failed: %v", err)
	}

	linkStatus := entity.LinkStatus{}
	if err := json.Unmarshal([]byte(m.Status), &linkStatus); err != nil {
		return err
	}
	xlog.Debugf("received [LinkStatus] message: %+v", linkStatus)

	device, err := p.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(linkStatus.Address))
	if err != nil {
		return err
	}

	go p.addLinkStatusLog(linkStatus)

	isOnline, _, _ := cache.GetConnection(device.MacAddress)
	// 2 offline 4 reconnecting failed
	if linkStatus.State != "online" {
		cache.SetOffline(linkStatus.Address)
		go p.UpdateChildrenConnectionState(linkStatus.Address, false)
	} else {
		go p.UpdateChildrenConnectionState(linkStatus.Address, true)
	}

	// 此处不记录设备上线事件, 设备上线事件在deviceStatus中记录
	isOnline, timestamp, _ := cache.GetConnection(linkStatus.Address)
	device.NotifyConnectionState(isOnline, timestamp)
	if !isOnline {
		p.addEvent(device, timestamp, int32(linkStatus.Param))
	}
	return nil
}

func (p LinkStatus) addEvent(device entity.Device, timestamp int64, code int32) {
	worker.EventsChan <- entity.Event{
		Code:      entity.EventCodeStatus,
		SourceID:  device.ID,
		Category:  entity.EventCategoryDevice,
		Timestamp: timestamp,
		ProjectID: device.ProjectID,
		Content:   fmt.Sprintf(`{"code": %d}`, code),
	}
}

func (p LinkStatus) addLinkStatusLog(linkStatus entity.LinkStatus) {
	e := entity.DeviceLinkStatus{
		MacAddress:             linkStatus.Address,
		LastCall:               linkStatus.LastCall,
		LastConnection:         uint(linkStatus.LastConnection),
		LastProvisioning:       linkStatus.LastProvisioning,
		NumProvisioningRetries: linkStatus.NumProvisioningRetries,
		State:                  linkStatus.State,
		StateUpdateTime:        linkStatus.StateUpdateTime,
		Status:                 linkStatus.Param,
	}
	if err := p.deviceLinkStatusRepo.Create(context.TODO(), &e); err != nil {
		xlog.Errorf("create device link status failed: %v => [%s]", err, linkStatus.Address)
	}
}

func (p LinkStatus) UpdateChildrenConnectionState(parent string, isOnline bool) {
	devices, _ := p.deviceRepo.FindBySpecs(context.TODO(), spec.ParentEqSpec(parent))
	var wg sync.WaitGroup
	for i := range devices {
		wg.Add(1)
		go func(device entity.Device) {
			if isOnline {
				cache.SetOnline(device.MacAddress)
				device.NotifyConnectionState(true, time.Now().Unix())
			} else {
				cache.SetOffline(device.MacAddress)
				device.NotifyConnectionState(false, time.Now().Unix())
			}
			wg.Done()
		}(devices[i])
	}
	wg.Wait()
}
