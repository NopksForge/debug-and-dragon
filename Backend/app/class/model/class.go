package model

import (
	"dndengine/app"
	"strings"
)

type ClassName string

const (
	CLASS_FIGHTER   ClassName = "Fighter"
	CLASS_WIZARD    ClassName = "Wizard"
	CLASS_CLERIC    ClassName = "Cleric"
	CLASS_ROGUE     ClassName = "Rogue"
	CLASS_RANGER    ClassName = "Ranger"
	CLASS_PALADIN   ClassName = "Paladin"
	CLASS_BARBARIAN ClassName = "Barbarian"
	CLASS_BARD      ClassName = "Bard"
	CLASS_DRUID     ClassName = "Druid"
	CLASS_MONK      ClassName = "Monk"
	CLASS_SORCERER  ClassName = "Sorcerer"
	CLASS_WARLOCK   ClassName = "Warlock"
)

type ClassConfig struct {
	Subname      string        `json:"subname"`
	HitDie       string        `json:"hit_die"`
	PrimaryStat  []app.StatKey `json:"primary_stat"`
	Armor        []string      `json:"armor"`
	SavingThrows []app.StatKey `json:"saving_throws"`
}

var ClassConfigs = map[ClassName]ClassConfig{
	CLASS_FIGHTER: {
		Subname:      "",
		HitDie:       "d10",
		PrimaryStat:  []app.StatKey{app.STAT_STR, app.STAT_DEX},
		Armor:        []string{"All armor", "Shields"},
		SavingThrows: []app.StatKey{app.STAT_STR, app.STAT_CON},
	},
	CLASS_WIZARD: {
		Subname:      "",
		HitDie:       "d6",
		PrimaryStat:  []app.StatKey{app.STAT_INT},
		Armor:        []string{"None"},
		SavingThrows: []app.StatKey{app.STAT_INT, app.STAT_WIS},
	},
	CLASS_CLERIC: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_WIS},
		Armor:        []string{"Light", "Medium", "Heavy (varies by domain)"},
		SavingThrows: []app.StatKey{app.STAT_WIS, app.STAT_CHA},
	},
	CLASS_ROGUE: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_DEX},
		Armor:        []string{"Light"},
		SavingThrows: []app.StatKey{app.STAT_DEX, app.STAT_INT},
	},
	CLASS_RANGER: {
		Subname:      "",
		HitDie:       "d10",
		PrimaryStat:  []app.StatKey{app.STAT_DEX, app.STAT_WIS},
		Armor:        []string{"Light", "Medium", "Shields"},
		SavingThrows: []app.StatKey{app.STAT_STR, app.STAT_DEX},
	},
	CLASS_PALADIN: {
		Subname:      "",
		HitDie:       "d10",
		PrimaryStat:  []app.StatKey{app.STAT_STR, app.STAT_CHA},
		Armor:        []string{"All armor", "Shields"},
		SavingThrows: []app.StatKey{app.STAT_WIS, app.STAT_CHA},
	},
	CLASS_BARBARIAN: {
		Subname:      "",
		HitDie:       "d12",
		PrimaryStat:  []app.StatKey{app.STAT_STR},
		Armor:        []string{"None / Light"},
		SavingThrows: []app.StatKey{app.STAT_STR, app.STAT_CON},
	},
	CLASS_BARD: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_CHA},
		Armor:        []string{"Light"},
		SavingThrows: []app.StatKey{app.STAT_DEX, app.STAT_CHA},
	},
	CLASS_DRUID: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_WIS},
		Armor:        []string{"Non-metal Light", "Non-metal Medium", "Shields"},
		SavingThrows: []app.StatKey{app.STAT_INT, app.STAT_WIS},
	},
	CLASS_MONK: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_DEX, app.STAT_WIS},
		Armor:        []string{"None"},
		SavingThrows: []app.StatKey{app.STAT_STR, app.STAT_DEX},
	},
	CLASS_SORCERER: {
		Subname:      "",
		HitDie:       "d6",
		PrimaryStat:  []app.StatKey{app.STAT_CHA},
		Armor:        []string{"None"},
		SavingThrows: []app.StatKey{app.STAT_CON, app.STAT_CHA},
	},
	CLASS_WARLOCK: {
		Subname:      "",
		HitDie:       "d8",
		PrimaryStat:  []app.StatKey{app.STAT_CHA},
		Armor:        []string{"Light"},
		SavingThrows: []app.StatKey{app.STAT_WIS, app.STAT_CHA},
	},
}

func FindClassConfig(name string) (ClassName, ClassConfig, bool) {
	if name == "" {
		return "", ClassConfig{}, false
	}
	for k, v := range ClassConfigs {
		if strings.EqualFold(string(k), name) {
			return k, v, true
		}
	}
	return "", ClassConfig{}, false
}
