package model

type CharacterData struct {
	ID    string         `json:"id"`
	Name  string         `json:"name"`
	Race  string         `json:"race"`
	Class string         `json:"class"`
	Stats CharacterStats `json:"stats"`
}

type CharacterStats struct {
	Strength     *int `json:"str" binding:"required"`
	Dexterity    *int `json:"dex" binding:"required"`
	Constitution *int `json:"con" binding:"required"`
	Intelligence *int `json:"int" binding:"required"`
	Wisdom       *int `json:"wis" binding:"required"`
	Charisma     *int `json:"cha" binding:"required"`
}
