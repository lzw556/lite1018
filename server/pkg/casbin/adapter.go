package casbin

import (
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	scas "github.com/qiangmzsx/string-adapter/v2"
	"sync"
)

var (
	enforcer *casbin.Enforcer
	once     sync.Once
	policies string
)

func Init(rbacModel string, rbacPolicies string) {
	once.Do(func() {
		policies = rbacPolicies
		m, err := model.NewModelFromString(rbacModel)
		if err != nil {
			panic(err)
		}
		a := scas.NewAdapter(rbacPolicies)
		enforcer, err = casbin.NewEnforcer(m, a)
		if err != nil {
			panic(err)
		}
	})
}

func Enforce(role string, path string, method string) (bool, error) {
	return enforcer.Enforce(role, path, method)
}

func GetFilteredPolicy(role string) [][]string {
	return enforcer.GetFilteredPolicy(0, role)
}

func Policies() string {
	return policies
}
