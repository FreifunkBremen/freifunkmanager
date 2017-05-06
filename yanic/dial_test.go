package yanic

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestLog(t *testing.T) {
	assert := assert.New(t)

	d := Dial("unix", "/tmp/yanic-database.socket")
	assert.NotNil(d)
	d.Start()
	time.Sleep(time.Duration(3) * time.Minute)
	d.Close()
}
