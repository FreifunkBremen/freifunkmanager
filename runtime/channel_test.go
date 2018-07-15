package runtime

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestChannel(t *testing.T) {
	assert := assert.New(t)

	ChannelEU = true
	assert.False(ChannelIs5GHz(11), "is 2.4 GHz in EU")
	assert.True(ChannelIs5GHz(40), "is 5 GHz everywhere")
	assert.False(ChannelIs5GHz(42), "is not 5 GHz in EU")

	assert.NotNil(GetChannel(11), "is 2.4 GHz  channel everywhere")
	assert.NotNil(GetChannel(40), "is 5 GHz  channel everywhere")
	assert.Nil(GetChannel(42), "is not a 5 GHz channel in EU")

	ChannelEU = false
	assert.False(ChannelIs5GHz(11), "is 2.4 GHz in EU")
	assert.True(ChannelIs5GHz(40), "is 5 GHz everywhere")
	assert.True(ChannelIs5GHz(42), "is 5 GHz somewhere else")

	assert.NotNil(GetChannel(11), "is 2.4 GHz channel everywhere")
	assert.NotNil(GetChannel(40), "is 5 GHz channel everywhere")
	assert.NotNil(GetChannel(42), "is 5 GHz channel somewhere else")

}
