package measurement

var Fields = map[Type][]string{
	BoltLooseningMeasurementType:      {"loosening_angle", "attitude", "motion"},
	BoltElongationMeasurementType:     {"preload", "temperature", "length", "defect", "attitude", "tof"},
	CorrosionThicknessMeasurementType: {"thickness", "corrosion_rate", "temperature", "tof"},
	PressureMeasurementType:           {"pressure", "temperature"},
	FlangeLooseningMeasurementType:    {"loosening_angles", "attitudes", "motions"},
	FlangeElongationMeasurementType:   {"preloads", "defects"},
	VibrationMeasurementType:          {"temperature", "frequency", "vibration_severity", "acceleration_peak", "displacement_peak", "acceleration_rms", "crest", "pulse", "margin", "kurtosis", "kurtosis_norm", "skewness", "skewness_norm", "fft_value_1", "fft_value_2", "fft_value_3", "fft_value_0", "spectrum_variance", "spectrum_mean", "spectrum_rms", "inclination"},
	AngleDipMeasurementType:           {"inclination"},
	TowerDisplacementMeasurementType:  {"displacement", "inclination"},
	TowerSettlementMeasurementType:    {"settlement", "inclination"},
}
