package model

type Skill string

type SkillConfig struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

const (
	SKILL_EXTRA_FEAT_AND_SKILL    Skill = "extra_feat_and_skill"
	SKILL_DARKVISION_60           Skill = "darkvision_60"
	SKILL_FEY_ANCESTRY            Skill = "fey_ancestry"
	SKILL_TRANCE                  Skill = "trance"
	SKILL_POISON_RESISTANCE       Skill = "poison_resistance"
	SKILL_DARKVISION              Skill = "darkvision"
	SKILL_STONECUNNING            Skill = "stonecunning"
	SKILL_DWARVEN_COMBAT_TRAINING Skill = "dwarven_combat_training"
	SKILL_LUCKY                   Skill = "lucky"
	SKILL_BRAVE                   Skill = "brave"
	SKILL_HALFLING_NIMBLENESS     Skill = "halfling_nimbleness"
	SKILL_GNOME_CUNNING           Skill = "gnome_cunning"
	SKILL_TWO_SKILL_PROFICIENCIES Skill = "two_skill_proficiencies"
	SKILL_RELENTLESS_ENDURANCE    Skill = "relentless_endurance"
	SKILL_SAVAGE_ATTACKS          Skill = "savage_attacks"
	SKILL_FIRE_RESISTANCE         Skill = "fire_resistance"
	SKILL_INFERNAL_LEGACY         Skill = "infernal_legacy"
	SKILL_BREATH_WEAPON           Skill = "breath_weapon"
	SKILL_DAMAGE_RESISTANCE       Skill = "damage_resistance"
)

var SkillConfigs = map[Skill]SkillConfig{
	SKILL_EXTRA_FEAT_AND_SKILL: {
		Name:        "Extra feat & skill",
		Description: "Variant rule: gain an extra feat and skill proficiency.",
	},
	SKILL_DARKVISION_60: {
		Name:        "Darkvision 60 ft",
		Description: "See in dim light within 60 feet as dim light, darkness as dim light (60 ft).",
	},
	SKILL_FEY_ANCESTRY: {
		Name:        "Fey Ancestry",
		Description: "Advantage on saves against being charmed; magic can't put you to sleep.",
	},
	SKILL_TRANCE: {
		Name:        "Trance",
		Description: "Only need 4 hours of sleep (meditation) instead of 8 for a long rest.",
	},
	SKILL_POISON_RESISTANCE: {
		Name:        "Poison resistance",
		Description: "Advantage on saves against poison; resistance to poison damage.",
	},
	SKILL_DARKVISION: {
		Name:        "Darkvision",
		Description: "See in darkness as dim light (range varies by race).",
	},
	SKILL_STONECUNNING: {
		Name:        "Stonecunning",
		Description: "History checks related to stonework; notice unusual stonework.",
	},
	SKILL_DWARVEN_COMBAT_TRAINING: {
		Name:        "Dwarven Combat Training",
		Description: "Proficiency with battleaxe, handaxe, throwing hammer, warhammer; light/heavy hammers.",
	},
	SKILL_LUCKY: {
		Name:        "Lucky",
		Description: "Reroll any natural 1 on attack rolls, saving throws, or ability checks (once per roll).",
	},
	SKILL_BRAVE: {
		Name:        "Brave",
		Description: "Advantage on saving throws against being frightened.",
	},
	SKILL_HALFLING_NIMBLENESS: {
		Name:        "Halfling Nimbleness",
		Description: "Move through the space of any creature that is of a size larger than yours.",
	},
	SKILL_GNOME_CUNNING: {
		Name:        "Gnome Cunning",
		Description: "Advantage on Wis, Int, Cha saving throws against magic.",
	},
	SKILL_TWO_SKILL_PROFICIENCIES: {
		Name:        "Skill versatility",
		Description: "Two skill proficiencies of your choice.",
	},
	SKILL_RELENTLESS_ENDURANCE: {
		Name:        "Relentless Endurance",
		Description: "Once per long rest: drop to 1 HP instead of 0 when reduced to 0.",
	},
	SKILL_SAVAGE_ATTACKS: {
		Name:        "Savage Attacks",
		Description: "When you score a critical hit with a melee weapon, add one extra weapon damage die.",
	},
	SKILL_FIRE_RESISTANCE: {
		Name:        "Fire resistance",
		Description: "Resistance to fire damage.",
	},
	SKILL_INFERNAL_LEGACY: {
		Name:        "Infernal Legacy",
		Description: "Innate spellcasting: thaumaturgy, hellish rebuke (2nd level), darkness (3rd level).",
	},
	SKILL_BREATH_WEAPON: {
		Name:        "Breath Weapon",
		Description: "Chosen element; scales with level. Action to exhale destructive energy.",
	},
	SKILL_DAMAGE_RESISTANCE: {
		Name:        "Damage resistance",
		Description: "Resistance to damage type matching your draconic ancestry.",
	},
}
