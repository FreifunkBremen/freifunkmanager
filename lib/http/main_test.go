package http

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

// Function to test the logging
// Input: pointer to teh testing object
func TestGetIP(t *testing.T) {
	assertion := assert.New(t)

	req, _ := http.NewRequest("GET", "https://google.com/lola/duda?q=wasd", nil)
	ip := GetRemoteIP(req)

	assertion.Equal("", ip, "no remote ip address")
}
