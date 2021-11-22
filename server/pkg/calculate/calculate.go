package calculate

import "github.com/bilibili/gengine/engine"

var pool *engine.GenginePool

func init() {
	var err error
	pool, err = engine.NewGenginePool(10, 20, 1, corrosionRateRule, map[string]interface{}{})
	if err != nil {
		panic(err)
	}
}

func Do(inputs interface{}, name string) (map[string]interface{}, error) {
	err, result := pool.ExecuteSelectedRules(map[string]interface{}{"inputs": inputs}, []string{name})
	return result, err
}
