package vo

import "strings"

type Casbin struct {
	Subject string `json:"subject"`
	Model   string `json:"model"`
	Rules   string `json:"rules"`
}

func NewCasbin(subject, model string) Casbin {
	return Casbin{
		Subject: subject,
		Model:   model,
	}
}

func (c *Casbin) SetRules(rules [][]string) {
	c.Rules = ""
	for _, rule := range rules {
		c.Rules += "p" + "," + strings.Join(rule, ",") + "\n"
	}
}
