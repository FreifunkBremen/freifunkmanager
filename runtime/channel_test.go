package runtime

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestChannel(t *testing.T) {
	assert := assert.New(t)

	ChannelEU = true
	assert.False(ChannelIs5GHz(9), "is 2.4 GHz in EU")
	assert.True(ChannelIs5GHz(44), "is 5 GHz everywhere")
	assert.False(ChannelIs5GHz(38), "is not 5 GHz in EU")

	assert.NotNil(GetChannel(9), "is 2.4 GHz  channel everywhere")
	assert.NotNil(GetChannel(44), "is 5 GHz  channel everywhere")
	assert.Nil(GetChannel(38), "is not a 5 GHz channel in EU")

	ChannelEU = false
	assert.False(ChannelIs5GHz(9), "is 2.4 GHz in EU")
	assert.True(ChannelIs5GHz(44), "is 5 GHz everywhere")
	assert.True(ChannelIs5GHz(38), "is 5 GHz somewhere else")

	assert.NotNil(GetChannel(9), "is 2.4 GHz channel everywhere")
	assert.NotNil(GetChannel(44), "is 5 GHz channel everywhere")
	assert.NotNil(GetChannel(38), "is 5 GHz channel somewhere else")

}
