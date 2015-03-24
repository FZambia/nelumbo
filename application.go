package main

import (
	"database/sql"
	"github.com/jmoiron/sqlx"
	"time"
)

type Message struct {
	Uid      string `json:"uid"`
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Text     string `json:"text"`
	Video    string `json:"video"`
}

type application struct {
	startedAt time.Time
	db        *sqlx.DB
}

func newApplication(db *sqlx.DB) *application {
	return &application{
		startedAt: time.Now(),
		db:        db,
	}
}

func (app *application) getMessageByUid(uid string) (*Message, error) {
	rows, err := app.db.NamedQuery("SELECT uid, sender, receiver, text, video FROM message WHERE uid=:uid LIMIT 1", map[string]interface{}{"uid": uid})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	var m Message
	for rows.Next() {
		err = rows.StructScan(&m)
		if err != nil {
			return nil, err
		}
	}
	return &m, nil
}

func (app *application) createMessage(uid, sender, receiver, text, video string) (*Message, error) {
	query := `INSERT INTO message (uid, sender, receiver, text, video) VALUES (:uid, :sender, :receiver, :text, :video)`
	_, err := app.db.NamedExec(query, map[string]interface{}{
		"uid":      uid,
		"sender":   sender,
		"receiver": receiver,
		"text":     text,
		"video":    video,
	})
	if err != nil {
		return nil, err
	}
	return &Message{
		Uid:      uid,
		Sender:   sender,
		Receiver: receiver,
		Text:     text,
		Video:    video,
	}, nil
}
