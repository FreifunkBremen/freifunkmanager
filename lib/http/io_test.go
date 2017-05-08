// Package http provides the
// logic of the webserver
package http

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

// Function to test the writing into a http response
// Input: pointer to testing object
func TestWrite(t *testing.T) {
	assert := assert.New(t)

	w := httptest.NewRecorder()
	from := map[string]string{"a": "b"}
	Write(w, from)
	result := w.Result()

	assert.Equal([]string{"application/json"}, result.Header["Content-Type"], "no header information")
	buf := new(bytes.Buffer)
	buf.ReadFrom(result.Body)
	to := buf.String()
	assert.Equal("{\"a\":\"b\"}", to, "wrong content")

	w = httptest.NewRecorder()
	value := make(chan int)
	Write(w, value)
	result = w.Result()

	assert.Equal(http.StatusInternalServerError, result.StatusCode, "wrong statuscode")

}

// Function to test the reading from a http response
// Input: pointer to testing object
func TestRead(t *testing.T) {
	assert := assert.New(t)

	to := make(map[string]string)
	r, _ := http.NewRequest("GET", "/a", strings.NewReader("{\"a\":\"b\"}"))

	r.Header["Content-Type"] = []string{"application/json"}
	err := Read(r, &to)
	assert.NoError(err, "no error")
	assert.Equal(map[string]string{"a": "b"}, to, "wrong content")

	r.Header["Content-Type"] = []string{""}
	err = Read(r, &to)
	assert.Error(err, "no error")
}
