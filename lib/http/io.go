// Package http provides the
// logic of the webserver
package http

import (
	"encoding/json"
	"errors"
	"net/http"
)

// Function to read data from a request via json format
// Input: pointer to http request r, interface to
func Read(r *http.Request, to interface{}) (err error) {
	if r.Header.Get("Content-Type") != "application/json" {
		err = errors.New("no json data recived")
		return
	}
	err = json.NewDecoder(r.Body).Decode(to)
	return
}

// Function to write data as json to a http output
// Input: http response writer w, interface data
func Write(w http.ResponseWriter, data interface{}) {
	js, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
