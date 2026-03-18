package model

import "dndengine/app"

type CharacterData struct {
	ID    string
	Name  string
	Race  string
	Class string
	Stats app.Stat
}
