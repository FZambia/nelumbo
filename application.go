package main

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
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
	var m Message
	err := app.db.QueryRowx("SELECT uid, sender, receiver, text, video FROM message WHERE uid=? LIMIT 1", uid).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &m, err
}

func (app *application) createMessage(uid, sender, receiver, text, video string) (*Message, error) {
	query := `INSERT INTO message (uid, sender, receiver, text, video) VALUES (?, ?, ?, ?, ?)`
	_, err := app.db.Exec(query, uid, sender, receiver, text, video)
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
