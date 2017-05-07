// A little lib for cronjobs to run it in background
package worker

import "time"

// a struct which handle the job
type Worker struct {
	every time.Duration
	run   func()
	quit  chan struct{}
}

// create a new Worker with timestamp run every and his function
func NewWorker(every time.Duration, f func()) (w *Worker) {
	w = &Worker{
		every: every,
		run:   f,
		quit:  make(chan struct{}),
	}
	return
}

// start the worker
// please us it as a goroutine: go w.Start()
func (w *Worker) Start() {
	ticker := time.NewTicker(w.every)
	for {
		select {
		case <-ticker.C:
			w.run()
		case <-w.quit:
			ticker.Stop()
			return
		}
	}
}

// stop the worker
func (w *Worker) Close() {
	close(w.quit)
}
