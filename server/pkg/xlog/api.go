package xlog

import (
	"sync"

	"go.uber.org/zap"
)

var log *Logger
var once sync.Once

func Init(mode string) {
	once.Do(func() {
		log = New(mode)
		log.z = log.z.WithOptions(zap.AddCallerSkip(1))
	})
}

func Debug(msg string) {
	log.Debug(msg)
}

func Debugf(template string, args ...interface{}) {
	log.Debugf(template, args...)
}

func Info(msg string) {
	log.Info(msg)
}

func Infof(template string, args ...interface{}) {
	log.Infof(template, args...)
}

func Warn(msg string) {
	log.Warn(msg)
}

func Warnf(template string, args ...interface{}) {
	log.Warnf(template, args...)
}

func Error(msg string, err error) {
	log.Error(msg, err)
}

func Errorf(template string, args ...interface{}) {
	log.Errorf(template, args...)
}

func Fatal(msg string) {
	log.Fatal(msg)
}
