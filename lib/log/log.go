// Package log provides the
// functionality to start und initialize to logger
package log

import (
	"log"
	"net/http"

	logger "github.com/Sirupsen/logrus"

	httpLib "github.com/FreifunkBremen/freifunkmanager/lib/http"
)

// current logger with configuration
var Log *logger.Logger

// Function to initiate a new logger
func init() {
	Log = logger.New()
	log.SetOutput(Log.Writer()) // Enable fallback if core logger
}

// Function to add the information of a http request to the log
// Input: pointer to the http request r
func HTTP(r *http.Request) *logger.Entry {
	return Log.WithFields(logger.Fields{
		"remote": httpLib.GetRemoteIP(r),
		"method": r.Method,
		"url":    r.URL.RequestURI(),
	})
}
