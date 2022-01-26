package calculate

import (
	"math"
)

func FlangeBoltPreloads(numOfBolts, numOfSensors, boltOffset int, sensorPreloads []float64) []float64 {
	calculateBoltPreloads := make([]float64, numOfBolts*3)
	seedSensorPreloads := make([]float64, numOfSensors*3)
	for i := 0; i < 3; i++ {
		for j := 0; j < numOfSensors; j++ {
			seedSensorPreloads[i*numOfSensors+j] = sensorPreloads[j]
		}
	}

	dt := 1.0 / float64(numOfBolts)
	ds := 1.0 / float64(numOfSensors)
	for i := 0; i < len(calculateBoltPreloads); i++ {
		for j := 0; j < len(seedSensorPreloads); j++ {
			calculateBoltPreloads[i] += seedSensorPreloads[j] * sinc((float64(i)*dt-float64(j)*ds)/ds)
		}
	}

	boltPreloads := make([]float64, numOfBolts)
	for i := 0; i < len(boltPreloads); i++ {
		boltPreloads[(i+boltOffset)%numOfBolts] = calculateBoltPreloads[i+numOfBolts]
	}
	return boltPreloads
}

func sinc(value float64) float64 {
	if value == 0 {
		return 1
	}
	return math.Sin(3.1415926*value) / (3.1415926 * value)
}
