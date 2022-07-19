package calculate

import (
	"fmt"
	"math"
	"os"

	gofft "github.com/mjibson/go-dsp/fft"
)

var PI float64 = 3.1415926

func powerExponentGet(num int) int {
	var i int = 0
	if num < 1 {
		return -1
	}

	for ; num > 1; i++ {
		num >>= 1
	}

	return i
}

func fftFrequencyGet(n int, frequency int) (output []float64) {
	output = make([]float64, n)
	for i := 1; i < n; i++ {
		output[i] = float64(i) * float64(frequency) / float64(n)
	}
	return
}

func defaultFFTOutputGet(pr []float64, n int, frequency int) (output [][2]float64) {
	frequencyArr := fftFrequencyGet(n, frequency)
	sz := len(frequencyArr) / 2
	output = make([][2]float64, sz)
	for i := 0; i < sz; i++ {
		if i == 0 {
			output[i][0] = pr[i] / (float64(sz) * 2) // 第一个值除以N, 其他除以N/2
		} else {
			output[i][0] = pr[i] / float64(sz)
		}
		output[i][1] = frequencyArr[i]
	}

	return
}

func writeFile(filename string, content string) {
	f, err := os.OpenFile(filename, os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		fmt.Println("Open file error")
		return
	}

	defer f.Close()

	_, err = f.WriteString(content)
	if err != nil {
		fmt.Println("Write file error")
		return
	}

	return
}

func FilterEnveloping(sigInput []float64, sigLen int, fs int) (y []float64) {
	y = make([]float64, sigLen)
	y1 := make([]float64, sigLen)
	var Gain1, Gain2, Gain3, Gain4 float64
	A1 := []float64{1, 0, 0}
	A2 := []float64{1, 0, 0}
	A3 := []float64{1, 0, 0}
	A4 := []float64{1, 0, 0}
	var B []float64

	if fs == 25600 || fs == 32000 || fs == 64000 {
		B = []float64{1, 0, -1}
	}

	if fs == 3200 || fs == 6400 || fs == 12800 || fs == 4000 || fs == 8000 || fs == 16000 {
		B = []float64{1, -2, 1}
	}

	if fs == 3200 {
		Gain1 = 0.6692284492015
		Gain2 = 0.5320226827825
		Gain3 = 0.4598627876721
		Gain4 = 0.4284153391466

		A1 = []float64{1, -0.9560568788836, 0.7208569179225}
		A2 = []float64{1, -0.7600453121848, 0.3680454189453}
		A3 = []float64{1, -0.6569579969606, 0.1824931537277}
		A4 = []float64{1, -0.6120323075014, 0.1016290490851}
	}

	if fs == 6400 {
		Gain1 = 0.8617132260247
		Gain2 = 0.7456732783894
		Gain3 = 0.6760007458991
		Gain4 = 0.6434627296319

		A1 = []float64{1, -1.615292270082, 0.8315606340164}
		A2 = []float64{1, -1.397773930134, 0.5849191834231}
		A3 = []float64{1, -1.267171892508, 0.4368310910886}
		A4 = []float64{1, -1.206178972157, 0.3676719463706}
	}

	if fs == 12800 {
		Gain1 = 0.94043605939
		Gain2 = 0.8678608701988
		Gain3 = 0.8194596685908
		Gain4 = 0.7954506753478

		A1 = []float64{1, -1.852259689302, 0.9094845482579}
		A2 = []float64{1, -1.709317384995, 0.7621260957998}
		A3 = []float64{1, -1.613987570962, 0.6638511034015}
		A4 = []float64{1, -1.566700049476, 0.6151026519156}
	}

	if fs == 25600 {
		Gain1 = 0.813293134381
		Gain2 = 0.813293134381
		Gain3 = 0.7114197435612
		Gain4 = 0.7114197435612

		A1 = []float64{1, 1.248159124522, 0.619759201656}
		A2 = []float64{1, -1.898660552914, 0.9132220093606}
		A3 = []float64{1, -1.776541916306, 0.7910839302951}
		A4 = []float64{1, 0.9467866489969, 0.2505907425029}
	}

	if fs == 4000 {
		Gain1 = 0.7500800767934
		Gain2 = 0.6128118141747
		Gain3 = 0.5375231888447
		Gain4 = 0.5040114256537

		A1 = []float64{1, -1.242773362695, 0.7575469444788}
		A2 = []float64{1, -1.015339858455, 0.4359073982443}
		A3 = []float64{1, -0.890597579638, 0.2594951757408}
		A4 = []float64{1, -0.835073472387, 0.1809722302276}
	}

	if fs == 8000 {
		Gain1 = 0.895112598426
		Gain2 = 0.7932820368185
		Gain3 = 0.7297430758919
		Gain4 = 0.6994245542181

		A1 = []float64{1, -1.719392914169, 0.8610574795347}
		A2 = []float64{1, -1.52378987341, 0.6493382738637}
		A3 = []float64{1, -1.40173993312, 0.5172323704475}
		A4 = []float64{1, -1.343502062906, 0.4541961539664}
	}
	if fs == 16000 {
		Gain1 = 0.9540801275367
		Gain2 = 0.8935445815181
		Gain3 = 0.8521620131752
		Gain4 = 0.831325409619

		A1 = []float64{1, -1.889650038641, 0.9266704715061}
		A2 = []float64{1, -1.769753403577, 0.8044249224958}
		A3 = []float64{1, -1.687791134778, 0.7208569179225}
		A4 = []float64{1, -1.646522180968, 0.6787794575084}
	}

	if fs == 32000 {
		Gain1 = 0.6871788798111
		Gain2 = 0.6871788798111
		Gain3 = 0.5851619453879
		Gain4 = 0.5851619453879

		A1 = []float64{1, -1.921568940765, 0.9310292857173}
		A2 = []float64{1, 0.5622634120123, 0.4982753276288}
		A3 = []float64{1, -1.816866774418, 0.8267434764508}
		A4 = []float64{1, 0.3567527522964, 0.07440777115018}
	}

	if fs == 64000 {
		Gain1 = 0.3932215300801
		Gain2 = 0.3932215300801
		Gain3 = 0.340647196875
		Gain4 = 0.340647196875

		A1 = []float64{1, -1.963156212147, 0.9655793257796}
		A2 = []float64{1, -0.8727234113001, 0.5486694530259}
		A3 = []float64{1, -1.905019166901, 0.9077281174868}
		A4 = []float64{1, -0.7093588422392, 0.1631121340362}
	}

	w0 := []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A1[0]*sigInput[sigLen-i-1] - A1[1]*w0[1] - A1[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain1
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A2[0]*y[i] - A2[1]*w0[1] - A2[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain2
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A3[0]*y[i] - A3[1]*w0[1] - A3[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain3
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A4[0]*y[i] - A4[1]*w0[1] - A4[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain4
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A1[0]*y[sigLen-i-1] - A1[1]*w0[1] - A1[2]*w0[2]
		y1[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain1
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A2[0]*y1[i] - A2[1]*w0[1] - A2[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain2
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A3[0]*y[i] - A3[1]*w0[1] - A3[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain3
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A4[0]*y[i] - A4[1]*w0[1] - A4[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain4
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	return
}

func FilterRMS(sigInput []float64, sigLen int, fs int) (y []float64) {
	y = make([]float64, sigLen)
	y1 := make([]float64, sigLen)
	var Gain1, Gain2, Gain3, Gain4 float64
	A1 := []float64{1, 0, 0}
	A2 := []float64{1, 0, 0}
	A3 := []float64{1, 0, 0}
	A4 := []float64{1, 0, 0}
	B := []float64{1, 0, -1}

	if fs == 3200 {
		Gain1 = 0.8155736240339
		Gain2 = 0.8155736240339
		Gain3 = 0.7139705429961
		Gain4 = 0.7139705429961

		A1 = []float64{1, -1.98785907011, 0.9881048007518}
		A2 = []float64{1, 1.113446774509, 0.5757031475066}
		A3 = []float64{1, -1.97101577136, 0.9712616870883}
		A4 = []float64{1, 0.8510147622218, 0.2082977963173}
	}

	if fs == 6400 {
		Gain1 = 0.4749242150895
		Gain2 = 0.4749242150895
		Gain3 = 0.4059772958994
		Gain4 = 0.4059772958994

		A1 = []float64{1, -1.993995137067, 0.9940568466914}
		A2 = []float64{1, -0.5691670626819, 0.4817237789536}
		A3 = []float64{1, -1.98541038267, 0.9854728687561}
		A4 = []float64{1, -0.4232883297477, 0.08183159050317}
	}

	if fs == 12800 {
		Gain1 = 0.2620396923622
		Gain2 = 0.2620396923622
		Gain3 = 0.2346806435164
		Gain4 = 0.2346806435164

		A1 = []float64{1, -1.99701107709, 0.9970265327167}
		A2 = []float64{1, -1.375351842323, 0.6529834375611}
		A3 = []float64{1, -1.992688050769, 0.9927037616035}
		A4 = []float64{1, -1.107592373777, 0.3266592085029}
	}

	if fs == 25600 {
		Gain1 = 0.1383256677613
		Gain2 = 0.1383256677613
		Gain3 = 0.1295215151886
		Gain4 = 0.1295215151886

		A1 = []float64{1, -1.725075596041, 0.8023984305827}
		A2 = []float64{1, -1.998508603277, 0.9985124703791}
		A3 = []float64{1, -1.996340516345, 0.9963444532195}
		A4 = []float64{1, -1.514748872895, 0.5813405772463}
	}

	if fs == 4000 {
		Gain1 = 0.6891762115176
		Gain2 = 0.6891762115176
		Gain3 = 0.5869909380296
		Gain4 = 0.5869909380296

		A1 = []float64{1, -1.990332598735, 0.990490174302}
		A2 = []float64{1, 0.4522624813387, 0.4692228248347}
		A3 = []float64{1, -1.976741790339, 0.976900342486}
		A4 = []float64{1, 0.3212610707845, 0.06407791168157}
	}

	if fs == 8000 {
		Gain1 = 0.3944801603216
		Gain2 = 0.3944801603216
		Gain3 = 0.3416523509564
		Gain4 = 0.3416523509564

		A1 = []float64{1, -1.995205083917, 0.9952446081052}
		A2 = []float64{1, -0.9018906918068, 0.5313708271853}
		A3 = []float64{1, -1.988316517266, 0.9883566065318}
		A4 = []float64{1, -0.6829964486329, 0.1485132753971}
	}
	if fs == 16000 {
		Gain1 = 0.2141644220906
		Gain2 = 0.2141644220906
		Gain3 = 0.1948376072821
		Gain4 = 0.1948376072821

		A1 = []float64{1, -1.521788529723, 0.7072030374532}
		A2 = []float64{1, -1.997610862125, 0.9976207570637}
		A3 = []float64{1, -1.994148098178, 0.9941581628984}
		A4 = []float64{1, -1.263135109712, 0.4140062060209}
	}

	if fs == 32000 {
		Gain1 = 0.111897439189
		Gain2 = 0.111897439189
		Gain3 = 0.1059565679103
		Gain4 = 0.1059565679103

		A1 = []float64{1, -1.787371744258, 0.8379645434351}
		A2 = []float64{1, -1.998807353549, 0.9988098288871}
		A3 = []float64{1, -1.9970718997, 0.9970744203727}
		A4 = []float64{1, -1.604439560809, 0.6489869415967}
	}

	if fs == 64000 {
		Gain1 = 0.05721454360902
		Gain2 = 0.05721454360902
		Gain3 = 0.05555894038593
		Gain4 = 0.05555894038593

		A1 = []float64{1, -1.901780931731, 0.9150044324564}
		A2 = []float64{1, -1.999404138042, 0.9994047570692}
		A3 = []float64{1, -1.99853546032, 0.9985360910002}
		A4 = []float64{1, -1.794208003702, 0.8064468862207}
	}

	w0 := []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A1[0]*sigInput[sigLen-i-1] - A1[1]*w0[1] - A1[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain1
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A2[0]*y[i] - A2[1]*w0[1] - A2[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain2
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A3[0]*y[i] - A3[1]*w0[1] - A3[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain3
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A4[0]*y[i] - A4[1]*w0[1] - A4[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain4
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A1[0]*y[sigLen-i-1] - A1[1]*w0[1] - A1[2]*w0[2]
		y1[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain1
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A2[0]*y1[i] - A2[1]*w0[1] - A2[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain2
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A3[0]*y[i] - A3[1]*w0[1] - A3[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain3
		w0[2] = w0[1]
		w0[1] = w0[0]
	}
	w0 = []float64{0, 0, 0}
	for i := 0; i < sigLen; i++ {
		w0[0] = A4[0]*y[i] - A4[1]*w0[1] - A4[2]*w0[2]
		y[i] = (B[0]*w0[0] + B[1]*w0[1] + B[2]*w0[2]) * Gain4
		w0[2] = w0[1]
		w0[1] = w0[0]
	}

	return
}

func mean(data []float64) float64 {
	var ret float64 = 0
	for _, v := range data {
		ret += v
	}
	return ret / float64(len(data))
}

func sampleNumGet(sampleNum int) (n int) {
	n = 2
	for n*2 <= sampleNum {
		n = n * 2
	}
	return n
}
func round(x float64) int {
	return int(math.Floor(x + 0.5))
}

func FFTFrequencyCalc(data []float64, sampleNum int, paramFrequency int) (output [][2]float64) {
	sampleNum = sampleNumGet(sampleNum)
	data = data[:sampleNum]
	fdataArr := removeMean(data)

	res := gofft.FFTReal(fdataArr)
	fftr := make([]float64, len(fdataArr))
	for i := 0; i < len(res); i++ {
		fftr[i] = math.Sqrt(real(res[i])*real(res[i]) + imag(res[i])*imag(res[i]))
	}

	output = defaultFFTOutputGet(fftr, sampleNum, paramFrequency)

	return
}

func AccelerationCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) []float64 {
	raw = raw[:sigLen]
	return DataConvert(removeMean(raw), fs, rangeVal, fullScale)
}

func AccelerationFrequencyCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) [][2]float64 {
	raw = raw[:sigLen]
	data := DataConvert(removeMean(raw), fs, rangeVal, fullScale)
	accFreq := FFTFrequencyCalc(data, len(data), fs)
	return accFreq
}

func VelocityCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) []float64 {
	sigLen = sampleNumGet(sigLen)
	raw = raw[:sigLen]
	data := DataConvert(removeMean(raw), fs, rangeVal, fullScale)
	velX1 := velocityCalc(data, sigLen, fs)
	for i := range velX1 {
		velX1[i] = velX1[i] * 1000.0
	}
	return velX1
}

func VelocityFrequencyCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) [][2]float64 {
	velX1 := VelocityCalc(raw, sigLen, fs, rangeVal, fullScale)
	velFreq := FFTFrequencyCalc(velX1, len(velX1), fs)
	return velFreq
}

func DisplacementCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) []float64 {
	sigLen = sampleNumGet(sigLen)
	raw = raw[:sigLen]
	data := DataConvert(removeMean(raw), fs, rangeVal, fullScale)
	disX1 := displacementCalc(data, sigLen, fs)
	for i := range disX1 {
		disX1[i] = disX1[i] * 1000.0 * 1000.0
	}
	return disX1
}

func DisplacementFrequencyCalc(raw []float64, sigLen int, fs int, rangeVal int, fullScale float64) [][2]float64 {
	disX1 := DisplacementCalc(raw, sigLen, fs, rangeVal, fullScale)
	disFreq := FFTFrequencyCalc(disX1, len(disX1), fs)
	return disFreq
}

func vibrationDataProcess(data []complex128, s1 int, e1 int, s2 int, e2 int) []complex128 {
	pr := make([]float64, len(data))
	pi := make([]float64, len(data))
	sigLen := len(data)
	for i := range data {
		pr[i] = real(data[i])
		pi[i] = imag(data[i])
	}

	if s1 <= s2 && e1 >= e2 {
		for i := 0; i < s1; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e1; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	} else if s1 >= s2 && e1 >= e2 && s1 <= e2 {
		for i := 0; i < s2; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e1; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	} else if s1 <= s2 && e1 <= e2 && s2 <= e1 {
		for i := 0; i < s1; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e2; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	} else if s1 <= s2 && e1 <= e2 && e1 <= s2 {
		for i := 0; i < s1; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e1; i < s2; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e2; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	} else if s1 >= s2 && e1 >= e2 && e2 <= s1 {
		for i := 0; i < s2; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e2; i < s1; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e1; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	} else if s1 >= s2 && e1 <= e2 {
		for i := 0; i < s2; i++ {
			pr[i] = 0
			pi[i] = 0
		}
		for i := e2; i < sigLen; i++ {
			pr[i] = 0
			pi[i] = 0
		}
	}

	for i := range data {
		data[i] = complex(pr[i], pi[i])
	}

	return data
}

func displacementCalc(data []float64, sigLen int, fs int) []float64 {
	var fmin float64 = float64(fs) / 340.0
	if fmin < 8.0 {
		fmin = 8.0
	}
	var fmax float64 = float64(fs) / 2.0
	if fmax > 2000.0 {
		fmax = 2000.0
	}
	var df float64 = 1.0 * float64(fs) / float64(sigLen)
	var dw float64 = 2 * PI * df

	HPStop := round(fmin/df + 0.5)
	LPStop := round(fmax/df+0.5) - 1

	w1 := make([]float64, 0)
	w2 := make([]float64, 0)
	for i := 0; i <= sigLen/2-1; i++ {
		w1 = append(w1, float64(i)*dw)
	}

	for i := 0; i <= sigLen/2-1; i++ {
		w2 = append(w2, -(float64(sigLen/2)*dw-dw)+float64(i)*dw)
	}
	w := append(w1, w2...)

	res := gofft.FFTReal(data)

	tmpre := make([]float64, sigLen)
	tmpim := make([]float64, sigLen)
	for i := 0; i < len(res); i++ {
		tmpre[i] = real(res[i])
		tmpim[i] = -imag(res[i])
	}

	are := make([]float64, len(res))
	aim := make([]float64, len(res))
	for i := 1; i < len(res); i++ {
		are[i] = tmpre[i] / w[i]
		aim[i] = tmpim[i] / w[i]
	}

	for i := 0; i < len(res); i++ {
		tmpre[i] = aim[i]
		tmpim[i] = -are[i]
	}

	for i := 1; i < len(res); i++ {
		are[i] = tmpre[i] / w[i]
		aim[i] = tmpim[i] / w[i]
	}

	for i := 0; i < len(res); i++ {
		tmpre[i] = aim[i]
		tmpim[i] = -are[i]
	}

	for i := 0; i < sigLen; i++ {
		are[i] = 0
		aim[i] = 0
	}

	for i := HPStop - 1; i <= LPStop-1; i++ {
		are[i] = tmpre[i]
		aim[i] = tmpim[i]
	}

	for i := sigLen - LPStop; i <= sigLen-HPStop; i++ {
		are[i] = tmpre[i]
		aim[i] = tmpim[i]
	}

	for i := 0; i < sigLen; i++ {
		res[i] = complex(are[i], aim[i])
	}

	res2 := gofft.IFFT(res)

	disp := make([]float64, sigLen)
	for i := range res2 {
		disp[i] = real(res2[i])
	}

	disp = removeMean(disp)

	return disp
}

func hilbert(data []float64) (output []complex128) {
	sampleNum := len(data)
	h := make([]float64, 0)
	if sampleNum%2 == 0 {
		for i := 0; i < sampleNum; i++ {
			if i == 0 || i == sampleNum/2 {
				h = append(h, 1.0)
			} else if i > 0 && i < sampleNum/2 {
				h = append(h, 2.0)
			} else {
				h = append(h, 0.0)
			}
		}
	} else {
		for i := 0; i < sampleNum; i++ {
			if i == 0 {
				h = append(h, 1.0)
			} else if i > 0 && i < (sampleNum+1)/2 {
				h = append(h, 2.0)
			} else {
				h = append(h, 0)
			}
		}
	}

	res := gofft.FFTReal(data)
	for i := 0; i < sampleNum; i++ {
		res[i] = complex(real(res[i])*h[i], imag(res[i])*h[i])
	}

	output = gofft.IFFT(res)
	return
}

func EnvelopCalc(data []float64) (highEnvelop []float64, lowEnvelop []float64) {
	output := hilbert(data)
	highEnvelop = make([]float64, len(output))
	for i := range output {
		highEnvelop[i] = math.Sqrt(real(output[i])*real(output[i]) + imag(output[i])*imag(output[i]))
	}

	data2 := make([]float64, len(data))
	for i := range data {
		data2[i] = -data[i]
	}
	output2 := hilbert(data2)
	lowEnvelop = make([]float64, len(output2))
	for i := range output2 {
		lowEnvelop[i] = math.Sqrt(real(output2[i])*real(output2[i]) + imag(output2[i])*imag(output2[i]))
	}

	for i := range lowEnvelop {
		lowEnvelop[i] = -lowEnvelop[i]
	}

	return
}

func DataConvert(fdataArr []float64, fs int, rangeVal int, fullScale float64) (output []float64) {
	if fullScale == 0 {
		switch fs {
		case 3200, 6400, 12800, 25600:
			fullScale = 65536 / 2
		case 4000, 8000, 16000, 32000, 64000:
			fullScale = 262144 / 2
		default:
			fullScale = 65536 / 2
		}
	} else {
		fullScale = fullScale / 2
	}
	gravityScale := fullScale / float64(rangeVal)

	output = make([]float64, len(fdataArr))
	for i := range fdataArr {
		output[i] = fdataArr[i] * 9.8 / gravityScale
	}
	return output
}

func removeMean(fdataArr []float64) (output []float64) {
	meanData := mean(fdataArr)
	output = make([]float64, len(fdataArr))
	for i := range fdataArr {
		output[i] = fdataArr[i] - meanData
	}
	return output
}

func printCurve(filename string, data []float64) {
	for i := range data {
		fmt.Printf("%s: %d\n", filename, i)
		writeFile(filename, fmt.Sprintf("%f,", data[i]))
	}
}

func velocityCalc(data []float64, sigLen int, fs int) []float64 {
	var fmin float64 = 1.0 * float64(fs) / 340
	var fmax float64 = 2000.0
	var df float64 = 1.0 * float64(fs) / float64(sigLen)
	var dw float64 = 2 * PI * df

	HPStop := round(fmin/df + 0.5)
	LPStop := round(fmax/df+0.5) - 1

	w1 := make([]float64, 0)
	w2 := make([]float64, 0)
	for i := 0; i <= sigLen/2-1; i++ {
		w1 = append(w1, float64(i)*dw)
	}

	for i := 0; i <= sigLen/2-1; i++ {
		w2 = append(w2, -(float64(sigLen/2)*dw-dw)+float64(i)*dw)
	}
	w := append(w1, w2...)

	res := gofft.FFTReal(data)

	tmpre := make([]float64, sigLen)
	tmpim := make([]float64, sigLen)
	for i := 0; i < len(res); i++ {
		tmpre[i] = real(res[i])
		tmpim[i] = -imag(res[i])
	}

	are := make([]float64, len(res))
	aim := make([]float64, len(res))
	for i := 1; i < len(res); i++ {
		are[i] = tmpre[i] / w[i]
		aim[i] = tmpim[i] / w[i]
	}

	for i := 0; i < len(res); i++ {
		tmpre[i] = aim[i]
		tmpim[i] = -are[i]
	}

	for i := 0; i < sigLen; i++ {
		are[i] = 0
		aim[i] = 0
	}

	for i := HPStop - 1; i <= LPStop-1; i++ {
		are[i] = tmpre[i]
		aim[i] = tmpim[i]
	}

	for i := sigLen - LPStop; i <= sigLen-HPStop; i++ {
		are[i] = tmpre[i]
		aim[i] = tmpim[i]
	}

	for i := 0; i < sigLen; i++ {
		res[i] = complex(are[i], aim[i])
	}

	res2 := gofft.IFFT(res)

	vel := make([]float64, sigLen)
	for i := range res2 {
		vel[i] = real(res2[i])
	}

	vel = removeMean(vel)

	return vel
}

//
//func main() {
//	fdataArr := make([]float64, 0)
//
//	f, err := os.OpenFile("rawData.csv", os.O_RDONLY, 0600)
//	if err != nil {
//		panic(err)
//	} else {
//		fmt.Printf("Open vib.csv successful!\n")
//	}
//
//	defer f.Close()
//
//	scanner := bufio.NewScanner(f)
//	for scanner.Scan() {
//		t := scanner.Text()
//		dataArr := strings.Split(t, ",")
//		for _, v := range dataArr {
//			fdata, err := strconv.ParseFloat(v, 64)
//			if err == nil {
//				fdataArr = append(fdataArr, fdata)
//			}
//		}
//	}
//
//	fdataArr = fdataArr[:1024]
//
//	// h, l := EnvelopCalc(disX1)
//
//	// var maxIndex int = 0
//	// var maxVal float64 = 0
//	// for i := 0; i < len(output); i++ {
//	// 	if output[i].FFTValue > maxVal {
//	// 		maxVal = output[i].FFTValue
//	// 		maxIndex = i
//	// 	}
//	// }
//
//	// fmt.Printf("Max [len=%d] v %f, i %d, f %f", len(output), maxVal, maxIndex, output[maxIndex].Frequency)
//
//	fs := 12800
//	rangeVal := 4
//
//	// rawData := AccelerationCalc(fdataArr, len(fdataArr), fs, 4)
//	// accFreq := AccelerationFrequencyCalc(fdataArr, len(fdataArr), fs, 4)
//
//	velData := VelocityCalc(fdataArr, len(fdataArr), fs, rangeVal)
//	dispData := DisplacementCalc(fdataArr, len(fdataArr), fs, rangeVal)
//
//	fmt.Printf("%f\n", dispData[0])
//
//	// printCurve("raw.csv", rawData)
//	printCurve("vel.csv", velData)
//	printCurve("disp.csv", dispData)
//}
