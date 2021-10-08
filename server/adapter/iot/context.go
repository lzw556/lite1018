package iot

import "sync"

type Context struct {
	Keys map[string]interface{}
	mu   sync.RWMutex
}

func NewContext() *Context {
	return &Context{
		Keys: map[string]interface{}{},
		mu:   sync.RWMutex{},
	}
}

func (c *Context) Set(key string, value interface{}) {
	c.mu.Lock()
	c.Keys[key] = value
	c.mu.Unlock()
}

func (c *Context) Get(key string) (interface{}, bool) {
	value, exists := c.Keys[key]
	return value, exists
}
