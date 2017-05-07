package worker

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestWorker(t *testing.T) {
	assert := assert.New(t)

	runtime := 0

	w := NewWorker(time.Duration(5)*time.Millisecond, func() {
		runtime = runtime + 1
	})
	go w.Start()
	time.Sleep(time.Duration(18) * time.Millisecond)
	w.Close()

	assert.Equal(3, runtime)
	time.Sleep(time.Duration(8) * time.Millisecond)
}
