package calculate

import (
	"fmt"
	gofft "github.com/mjibson/go-dsp/fft"
	"math"
	"os"
)

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

func fft(pr []float64, pi []float64, n int) (fr []float64, fi []float64) {
	var it, m, is, i, j, nv, l0 int
	var vr, vi, p, q, s, poddr, poddi float64
	fr = make([]float64, n)
	fi = make([]float64, n)

	k := int(math.Log(float64(n)) / math.Log(2))
	//将pr[0]和pi[0]循环赋值给fr[]和fi[]
	for it = 0; it <= n-1; it++ {
		m = it
		is = 0
		for i = 0; i <= k-1; i++ {
			j = m / 2
			is = 2*is + (m - 2*j)
			m = j
		}
		fr[it] = pr[is]
		fi[it] = pi[is]
	}
	pr[0] = 1.0
	pi[0] = 0.0
	p = 6.283185306 / (1.0 * float64(n))
	//将w=e^-j2pi/n用欧拉公式表示
	pr[1] = math.Cos(p)
	pi[1] = -math.Sin(p)

	//计算pr[]
	for i = 2; i <= n-1; i++ {
		p = pr[i-1] * pr[1]
		q = pi[i-1] * pi[1]
		s = (pr[i-1] + pi[i-1]) * (pr[1] + pi[1])
		pr[i] = p - q
		pi[i] = s - p - q
	}
	for it = 0; it <= n-2; it = it + 2 {
		vr = fr[it]
		vi = fi[it]
		fr[it] = vr + fr[it+1]
		fi[it] = vi + fi[it+1]
		fr[it+1] = vr - fr[it+1]
		fi[it+1] = vi - fi[it+1]
	}
	m = n / 2
	nv = 2
	//蝴蝶操作
	for l0 = k - 2; l0 >= 0; l0-- {
		m = m / 2
		nv = 2 * nv
		for it = 0; it <= (m-1)*nv; it = it + nv {
			for j = 0; j <= (nv/2)-1; j++ {
				p = pr[m*j] * fr[it+j+nv/2]
				q = pi[m*j] * fi[it+j+nv/2]
				s = pr[m*j] + pi[m*j]
				s = s * (fr[it+j+nv/2] + fi[it+j+nv/2])
				poddr = p - q
				poddi = s - p - q
				fr[it+j+nv/2] = fr[it+j] - poddr
				fi[it+j+nv/2] = fi[it+j] - poddi
				fr[it+j] = fr[it+j] + poddr
				fi[it+j] = fi[it+j] + poddi
			}
		}
	}

	////幅值计算
	//for (i = 0; i <= n - 1; i++) {
	//	pr[i] = sqrt(fr[i] * fr[i] + fi[i] * fi[i]);
	//}

	for i = 0; i <= n-1; i++ {
		pr[i] = fr[i]
		pi[i] = fi[i]
	}

	return
}

type FFTOutput struct {
	FFTValue  float64
	Frequency float64
}

func fftFrequencyGet(n int, frequency int) (output []float64) {
	output = make([]float64, n)
	for i := 1; i < n; i++ {
		output[i] = float64(i) * float64(frequency) / float64(n)
	}
	return
}

func defaultFFTFind(pr []float64, frequency []float64, outputNum int, n int, baseFrequency float64) (output []FFTOutput) {
	output = make([]FFTOutput, outputNum)
	if baseFrequency < 1 {
		var maxPr float64 = 0
		var index int = 1
		for i := 0; i < n; i++ {
			if math.Abs(pr[i]) > maxPr {
				maxPr = math.Abs(pr[i])
				index = i
			}
		}

		baseFrequency = frequency[index]
	}

	for i := 0; i < outputNum; i++ {
		var param float64
		if i < 1 {
			param = 0.5
		} else {
			param = float64(i)
		}

		var frequencyBack float64 = baseFrequency * param
		var differenceFrequencyValue float64
		if frequencyBack < 15 {
			differenceFrequencyValue = baseFrequency / 2
		} else {
			differenceFrequencyValue = 10
		}

		var maxPr float64
		var index int = -1
		for j := 0; j < n; j++ {
			if frequency[j] > frequencyBack-differenceFrequencyValue && frequency[j] < frequencyBack+differenceFrequencyValue {
				if math.Abs(pr[j]) > maxPr {
					maxPr = math.Abs(pr[j])
					index = j
				}
			}

			if frequency[j] >= frequencyBack+differenceFrequencyValue {
				break
			}
		}
		if index >= 0 {
			output[i].FFTValue = pr[index]
			output[i].Frequency = frequency[index]
		}
	}

	return
}

func fftOutputConvert(output []FFTOutput, outputNum int, n int, scale int, rangeVal int) (outputResult []FFTOutput) {
	outputResult = make([]FFTOutput, outputNum)
	for i := 0; i < outputNum; i++ {
		outputResult[i].FFTValue = output[i].FFTValue * 9.8 / float64(scale) * float64(rangeVal) / float64(n)
		outputResult[i].Frequency = output[i].Frequency
	}
	return
}

func defaultFFTOutputGet(pr []float64, n int, frequency int) (output []FFTOutput) {
	frequencyArr := fftFrequencyGet(n, frequency)
	sz := len(frequencyArr) / 2
	output = make([]FFTOutput, sz)
	for i := 0; i < sz; i++ {
		output[i].FFTValue = pr[i]
		output[i].Frequency = frequencyArr[i]
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

func filterEnveloping(sigInput []float64, sigLen int, fs float64) (y []float64) {
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

func filterRMS(sigInput []float64, sigLen int, fs float64) (y []float64) {
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

func FFTFrequencyCalc(mPr []float64, sampleNum int, paramFrequency int) (output []FFTOutput) {
	var prSum float64 = 0
	var prAverage float64 = 0
	var i int
	for i = 0; i < sampleNum; i++ {
		prSum += mPr[i]
	}

	prAverage = prSum / float64(sampleNum)
	for i = 0; i < sampleNum; i++ {
		mPr[i] -= prAverage
	}

	fftResult := gofft.FFTReal(mPr)
	for i := 0; i < len(fftResult); i++ {
		mPr[i] = math.Sqrt(real(fftResult[i])*real(fftResult[i]) + imag(fftResult[i])*imag(fftResult[i]))
	}

	output = defaultFFTOutputGet(mPr, sampleNum, paramFrequency)

	return
}

func VelocityCalc(accXX []float64, sigLen int, fs float64) (velX1 []float64) {
	accX1 := filterRMS(accXX, sigLen, fs)
	velX := make([]float64, sigLen)
	velX[0] = accX1[0] / 2.0
	for i := 1; i < sigLen; i++ {
		velX[i] = velX[i-1] + accX1[i]
	}
	for i := range velX {
		velX[i] = velX[i] * 1000 / fs
	}
	velX1 = filterRMS(velX, sigLen, fs)
	return
}

func DisplacementCalc(velX1 []float64, sigLen int, fs float64) (disX1 []float64) {
	disX := make([]float64, sigLen)
	disX[0] = velX1[0] / 2
	for i := 1; i < sigLen; i++ {
		disX[i] = disX[i-1] + velX1[i]
	}
	for i := range disX {
		disX[i] = disX[i] * 1000 / fs
	}
	disX1 = filterRMS(disX, sigLen, fs)
	return
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

	fftResult := gofft.FFTReal(data)
	for i := 0; i < sampleNum; i++ {
		fftResult[i] = complex(real(fftResult[i])*h[i], imag(fftResult[i])*h[i])
	}

	output = gofft.IFFT(fftResult)
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
//	// fdataArr = fdataArr[:8192]
//
//	// fullScale := 65536.0 / 2.0
//	// measuringRangeUnitG := 2.0
//	// gravityScale := fullScale / measuringRangeUnitG
//
//	// meanAccX1 := mean(fdataArr)
//	// accXX := make([]float64, len(fdataArr))
//	// for i := range fdataArr {
//	// 	accXX[i] = fdataArr[i] - meanAccX1
//	// 	accXX[i] = accXX[i] * 9.8 / gravityScale
//	// }
//
//	// velX1 := VelocityCalc(accXX, len(accXX), 12800)
//	// disX1 := DisplacementCalc(velX1, len(velX1), 12800)
//
//	// h, l := EnvelopCalc(disX1)
//
//	// output := FFTFrequencyCalc(disX1, len(disX1), 12800)
//	output := FFTFrequencyCalc(fdataArr, len(fdataArr), 12800)
//
//	// for i := 0; i < 10; i++ {
//	// 	fmt.Printf("%f\n", output[i].FFTValue)
//	// }
//	var maxIndex int = 0
//	var maxVal float64 = 0
//	for i := 0; i < len(output); i++ {
//		if output[i].FFTValue > maxVal {
//			maxVal = output[i].FFTValue
//			maxIndex = i
//		}
//	}
//
//	fmt.Printf("Max [len=%d] v %f, i %d, f %f", len(output), maxVal, maxIndex, output[maxIndex].Frequency)
//	// for i := range output {
//	// 	fmt.Printf("i=%d\n", i)
//	// 	writeFile("fftr.txt", fmt.Sprintf("%f,", output[i].FFTValue))
//	// }
//}
