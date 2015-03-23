package main

import (
	"fmt"
	"log"
	"net/http"
	"encoding/json"

	"github.com/julienschmidt/httprouter"
	"github.com/nu7hatch/gouuid"
)

func (app *application) homeHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprint(w, "I work, baby!")
}

func (app *application) createHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uid, err := uuid.NewV4()
	if err != nil {
		log.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	message, err := app.createMessage(uid.String(), r.FormValue("sender"), r.FormValue("receiver"), r.FormValue("text"), r.FormValue("video"))
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
