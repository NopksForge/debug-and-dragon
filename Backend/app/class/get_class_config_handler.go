package class

import (
	"dndengine/app"
	"dndengine/app/class/model"
	"log/slog"

	"github.com/gin-gonic/gin"
)

type getClassConfigResponse struct {
	Name         string        `json:"name"`
	Subname      string        `json:"subname"`
	HitDie       string        `json:"hit_die"`
	PrimaryStat  []app.StatKey `json:"primary_stat"`
	Armor        []string      `json:"armor"`
	SavingThrows []app.StatKey `json:"saving_throws"`
}

func (h *Handler) GetClassConfig(c *gin.Context) {
	name := c.Param("name")
	if name == "" {
		app.ReturnBadRequest(c)
		return
	}

	className, cfg, ok := model.FindClassConfig(name)
	if !ok {
		slog.Error("class not found", "class", name, "x-ref-id", app.RefID(c))
		app.ReturnNotFound(c)
		return
	}

	slog.Info("get class config success", "x-ref-id", app.RefID(c), "class", className)
	app.ReturnSuccess(c, getClassConfigResponse{
		Name:         string(className),
		Subname:      cfg.Subname,
		HitDie:       cfg.HitDie,
		PrimaryStat:  cfg.PrimaryStat,
		Armor:        cfg.Armor,
		SavingThrows: cfg.SavingThrows,
	})
}
