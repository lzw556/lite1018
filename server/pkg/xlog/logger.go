package xlog

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
	z *zap.Logger
}

func New(mode string) *Logger {
	core := NewZapCore(mode)
	return &Logger{
		z: zap.New(core, zap.AddCaller(), zap.Development()),
	}
}

func NewZapCore(mode string) zapcore.Core {
	var cores []zapcore.Core
	hook := lumberjack.Logger{
		Filename: "logs/ts.log",
		MaxSize:  60,
		Compress: true,
	}
	fileWriter := zapcore.AddSync(&hook)

	atomicLevel := zap.NewAtomicLevel()
	switch mode {
	case "debug":
		atomicLevel.SetLevel(zapcore.DebugLevel)
	default:
		atomicLevel.SetLevel(zapcore.InfoLevel)
	}

	cores = append(cores, zapcore.NewCore(zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()), fileWriter, atomicLevel))

	consoleWriter := zapcore.AddSync(os.Stdout)

	cores = append(cores, zapcore.NewCore(zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig()), consoleWriter, atomicLevel))

	return zapcore.NewTee(cores...)
}

func (l Logger) Debug(msg string) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Debug(msg)
}

func (l Logger) Debugf(msg string, args ...interface{}) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Sugar().Debugf(msg, args...)
}

func (l Logger) Info(msg string) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Info(msg)
}

func (l Logger) Infof(msg string, args ...interface{}) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Sugar().Infof(msg, args...)
}

func (l Logger) Warn(msg string) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Warn(msg)
}

func (l Logger) Warnf(msg string, args ...interface{}) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Sugar().Warnf(msg, args...)
}

func (l Logger) Error(msg string, err error) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Error(msg, zap.String("REASON", err.Error()))
}

func (l Logger) Errorf(msg string, args ...interface{}) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Sugar().Errorf(msg, args...)
}

func (l Logger) Fatal(msg string) {
	l.z.WithOptions(zap.AddCallerSkip(1)).Fatal(msg)
}
