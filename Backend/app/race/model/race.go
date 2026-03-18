package model

import (
	"dndengine/app"
	skillmodel "dndengine/app/skill/model"
)

type race string

const (
	RACE_HUMAN      race = "Human"
	RACE_ELF        race = "Elf"
	RACE_DWARF      race = "Dwarf"
	RACE_HALFLING   race = "Halfling"
	RACE_GNOME      race = "Gnome"
	RACE_HALF_ELF   race = "Half-Elf"
	RACE_HALF_ORC   race = "Half-Orc"
	RACE_TIEFLING   race = "Tiefling"
	RACE_DRAGONBORN race = "Dragonborn"
)

type Size string

const (
	SIZE_SMALL  Size = "Small"
	SIZE_MEDIUM Size = "Medium"
)

type Vision string

const (
	VISION_NORMAL     Vision = "Normal"
	VISION_DARKVISION Vision = "Darkvision"
)

type Traits struct {
	Bonuses  app.Stat           `json:"bonuses"`
	Speed    int                `json:"speed"`
	Size     Size               `json:"size"`
	Special  []skillmodel.Skill `json:"special"`
	Lifespan int                `json:"lifespan"`
	Vision   Vision             `json:"vision"`
}

var RaceConfigs = map[race]Traits{
	RACE_HUMAN: {
		Bonuses: app.Stat{
			Strength:     1,
			Dexterity:    1,
			Constitution: 1,
			Intelligence: 1,
			Wisdom:       1,
			Charisma:     1,
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_EXTRA_FEAT_AND_SKILL},
		Lifespan: 80,
		Vision:   VISION_NORMAL,
	},
	RACE_ELF: {
		Bonuses: app.Stat{
			Dexterity: 2,
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_DARKVISION_60, skillmodel.SKILL_FEY_ANCESTRY, skillmodel.SKILL_TRANCE},
		Lifespan: 700,
		Vision:   VISION_DARKVISION,
	},
	RACE_DWARF: {
		Bonuses: app.Stat{
			Constitution: 2,
		},
		Speed:    25,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_POISON_RESISTANCE, skillmodel.SKILL_DARKVISION, skillmodel.SKILL_STONECUNNING, skillmodel.SKILL_DWARVEN_COMBAT_TRAINING},
		Lifespan: 350,
		Vision:   VISION_DARKVISION,
	},
	RACE_HALFLING: {
		Bonuses: app.Stat{
			Dexterity: 2,
		},
		Speed:    25,
		Size:     SIZE_SMALL,
		Special:  []skillmodel.Skill{skillmodel.SKILL_LUCKY, skillmodel.SKILL_BRAVE, skillmodel.SKILL_HALFLING_NIMBLENESS},
		Lifespan: 150,
		Vision:   VISION_NORMAL,
	},
	RACE_GNOME: {
		Bonuses: app.Stat{
			Intelligence: 2,
		},
		Speed:    25,
		Size:     SIZE_SMALL,
		Special:  []skillmodel.Skill{skillmodel.SKILL_DARKVISION_60, skillmodel.SKILL_GNOME_CUNNING},
		Lifespan: 400,
		Vision:   VISION_DARKVISION,
	},
	RACE_HALF_ELF: {
		Bonuses: app.Stat{
			Charisma: 2,
			// +1 to two other stats is chosen per character; not encoded here.
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_DARKVISION, skillmodel.SKILL_FEY_ANCESTRY, skillmodel.SKILL_TWO_SKILL_PROFICIENCIES},
		Lifespan: 180,
		Vision:   VISION_DARKVISION,
	},
	RACE_HALF_ORC: {
		Bonuses: app.Stat{
			Strength:     2,
			Constitution: 1,
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_DARKVISION, skillmodel.SKILL_RELENTLESS_ENDURANCE, skillmodel.SKILL_SAVAGE_ATTACKS},
		Lifespan: 75,
		Vision:   VISION_DARKVISION,
	},
	RACE_TIEFLING: {
		Bonuses: app.Stat{
			Charisma:     2,
			Intelligence: 1,
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_FIRE_RESISTANCE, skillmodel.SKILL_DARKVISION_60, skillmodel.SKILL_INFERNAL_LEGACY},
		Lifespan: 90,
		Vision:   VISION_DARKVISION,
	},
	RACE_DRAGONBORN: {
		Bonuses: app.Stat{
			Strength: 2,
			Charisma: 1,
		},
		Speed:    30,
		Size:     SIZE_MEDIUM,
		Special:  []skillmodel.Skill{skillmodel.SKILL_BREATH_WEAPON, skillmodel.SKILL_DAMAGE_RESISTANCE},
		Lifespan: 80,
		Vision:   VISION_NORMAL,
	},
}
