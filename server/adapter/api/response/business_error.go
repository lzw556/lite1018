package response

import (
	"fmt"
)

type BusinessError struct {
	Code   BusinessErrorCode
	Reason string
}

func (b BusinessError) Error() string {
	return fmt.Sprintf("bussiness error reason = %s, code = %d", b.Reason, b.Code)
}

func BusinessErr(code BusinessErrorCode, reason string) BusinessError {
	return BusinessError{
		Code:   code,
		Reason: reason,
	}
}

func UnknownBusinessErr(err error) BusinessError {
	return BusinessError{
		Code:   UnknownBusinessError,
		Reason: err.Error(),
	}
}
