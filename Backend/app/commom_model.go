package app

// -- STAT -------------------------------------------------------------

type StatKey string

const (
	STAT_STR StatKey = "STR"
	STAT_DEX StatKey = "DEX"
	STAT_CON StatKey = "CON"
	STAT_INT StatKey = "INT"
	STAT_WIS StatKey = "WIS"
	STAT_CHA StatKey = "CHA"
)

type Stat struct {
	Strength     int
	Dexterity    int
	Constitution int
	Intelligence int
	Wisdom       int
	Charisma     int
}

type StatRequest struct {
	Strength     *int `json:"str" binding:"required"`
	Dexterity    *int `json:"dex" binding:"required"`
	Constitution *int `json:"con" binding:"required"`
	Intelligence *int `json:"int" binding:"required"`
	Wisdom       *int `json:"wis" binding:"required"`
	Charisma     *int `json:"cha" binding:"required"`
}

type StatResponse struct {
	Strength     int `json:"str,omitempty"`
	Dexterity    int `json:"dex,omitempty"`
	Constitution int `json:"con,omitempty"`
	Intelligence int `json:"int,omitempty"`
	Wisdom       int `json:"wis,omitempty"`
	Charisma     int `json:"cha,omitempty"`
}

func (req StatRequest) ToStat() Stat {
	return Stat{
		Strength:     *req.Strength,
		Dexterity:    *req.Dexterity,
		Constitution: *req.Constitution,
		Intelligence: *req.Intelligence,
		Wisdom:       *req.Wisdom,
		Charisma:     *req.Charisma,
	}
}

func (stat Stat) ToResponse() StatResponse {
	return StatResponse{
		Strength:     stat.Strength,
		Dexterity:    stat.Dexterity,
		Constitution: stat.Constitution,
		Intelligence: stat.Intelligence,
		Wisdom:       stat.Wisdom,
		Charisma:     stat.Charisma,
	}
}
