package response

type InvalidParameterError string

func (e InvalidParameterError) Error() string {
	return string(e)
}
