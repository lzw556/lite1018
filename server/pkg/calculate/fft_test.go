package calculate

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"testing"
)

func Test_AccelerationFrequencyCalc(t *testing.T) {
	file, err := os.Open("../../testdata/acc_y.csv")
	if err != nil {
		t.Error(err)
	}
	defer file.Close()
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		t.Error(err)
	}
	rawData := make([]float64, 0)
	for _, record := range records {
		v, _ := strconv.ParseFloat(record[0], 64)
		rawData = append(rawData, v)
	}
	fftOutput := AccelerationFrequencyCalc(rawData, len(rawData), 3200, 8)
	maxIndex := 0
	maxValue := 0.0
	for i, output := range fftOutput {
		if maxValue < output.FFTValue {
			maxValue = output.FFTValue
			maxIndex = i
		}
	}
	fmt.Println(fmt.Sprintf("max frequency: %f, max value: %f", fftOutput[maxIndex].Frequency, fftOutput[maxIndex].FFTValue))
}
