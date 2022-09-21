package response

type InvalidParameterError string

func (e InvalidParameterError) Error() string {
	return string(e)
}

type InvalidParameterErrorWithDetail string

func (e InvalidParameterErrorWithDetail) Error() string {
	return string(e)
}
