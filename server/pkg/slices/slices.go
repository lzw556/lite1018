package slices

func Expand[T any](v []T, size int, fill T) []T {
	values := make([]T, size)
	for i := range values {
		if i < len(v) {
			values[i] = v[i]
			continue
		}
		values[i] = fill
	}
	return values
}
