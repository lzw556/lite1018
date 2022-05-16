package devicetype

import "time"

const (
	GatewayType                    = 1
	RouterType                     = 257
	BoltLooseningType              = 131073
	BoltElongationType             = 196609
	VibrationTemperature3AxisType  = 327938
	VibrationTemperature3Axis2Type = 327940
	VibrationTemperature1AxisType  = 327682
	CurrentType                    = 458753
	TemperatureType                = 393217
	NormalTemperatureCorrosionType = 262145
	HighTemperatureCorrosionType   = 262401
	PressureTemperatureType        = 524290
	AngleDipType                   = 589825
)

type Typer interface {
	ID() uint
	SensorID() uint
	Settings() Settings
	Properties(sensorID uint) Properties
}

var types = []Typer{
	Gateway{},
	Router{},
	BoltLoosening{},
	BoltElongation{},
	VibrationTemperature3Axis{},
	NormalTemperatureCorrosion{},
	HighTemperatureCorrosion{},
	AngleDip{},
}

func Get(id uint) Typer {
	for _, t := range types {
		if t.ID() == id {
			return t
		}
	}
	return nil
}

var samplePeriodOption1 = map[int]string{
	int(time.Minute.Milliseconds()):      "1分钟",
	int(2 * time.Minute.Milliseconds()):  "2分钟",
	int(5 * time.Minute.Milliseconds()):  "5分钟",
	int(10 * time.Minute.Milliseconds()): "10分钟",
	int(20 * time.Minute.Milliseconds()): "20分钟",
	int(30 * time.Minute.Milliseconds()): "30分钟",
	int(time.Hour.Milliseconds()):        "1小时",
	int(2 * time.Hour.Milliseconds()):    "2小时",
	int(4 * time.Hour.Milliseconds()):    "4小时",
	int(6 * time.Hour.Milliseconds()):    "6小时",
	int(8 * time.Hour.Milliseconds()):    "8小时",
	int(12 * time.Hour.Milliseconds()):   "12小时",
	int(24 * time.Hour.Milliseconds()):   "24小时",
}

var smaplePeriodOffsetOption1 = map[int]string{
	int(10 * time.Second.Milliseconds()): "10秒",
	int(20 * time.Second.Milliseconds()): "20秒",
	int(30 * time.Second.Milliseconds()): "30秒",
	int(40 * time.Second.Milliseconds()): "40秒",
	int(50 * time.Second.Milliseconds()): "50秒",
	int(1 * time.Minute.Milliseconds()):  "1分钟",
	int(2 * time.Minute.Milliseconds()):  "2分钟",
	int(3 * time.Minute.Milliseconds()):  "3分钟",
}
