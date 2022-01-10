package measurementtype

type FlangeElongation struct {
}

func (FlangeElongation) ID() uint {
	return FlangeElongationType
}

func (FlangeElongation) Variables() Variables {
	return []Variable{}
}
