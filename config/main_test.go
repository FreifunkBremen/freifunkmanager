package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReadConfig(t *testing.T) {
	assert := assert.New(t)

	config := ReadConfigFile("../config_example.conf")
	assert.NotNil(config)

	assert.Equal(":8080", config.WebserverBind)

	assert.Panics(func() {
		ReadConfigFile("../config_example.co")
	}, "wrong file")

	assert.Panics(func() {
		ReadConfigFile("testdata/config_panic.conf")
	}, "wrong toml")
}
