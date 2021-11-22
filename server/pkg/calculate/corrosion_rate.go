package calculate

import (
	"math"
)

type CorrosionRateInputs [3]float32

const corrosionRateRule = `
RULE "corrosion_rate_rule" "corrosion rate rule"
BEGIN
return (CorrosionRateInputs[0] - CorrosionRateInputs[1]) / CorrosionRateInputs[3] * 365 * 24 * 60 * 60
END
`

func CorrosionRate(first float32, second float32, diff float64) float32 {
	return float32(math.Abs(float64(second-first))/diff) * 365 * 24 * 60 * 60
}
