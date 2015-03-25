package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/nu7hatch/gouuid"
)

func (app *application) createHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uid, err := uuid.NewV4()
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	sender := r.FormValue("sender")
	receiver := r.FormValue("receiver")
	text := r.FormValue("text")
	video := r.FormValue("video")
	if len(sender) > 64 || len(receiver) > 64 || len(text) > 2000 || len(video) > 255 {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	message, err := app.createMessage(uid.String(), sender, receiver, text, video)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

func (app *application) retrieveHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uid := ps.ByName("uid")
	message, err := app.getMessageByUid(uid)
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if message == nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}
