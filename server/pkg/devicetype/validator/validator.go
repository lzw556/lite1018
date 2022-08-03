package validator

type Validator interface {
	Validate(value interface{}) bool
}
