package class

import (
	"dndengine/app"
	"dndengine/app/class/model"
	"log/slog"
	"sort"

	"github.com/gin-gonic/gin"
)

type listClassResponseData struct {
	Name        string        `json:"name"`
	Subname     string        `json:"subname"`
	PrimaryStat []app.StatKey `json:"primary_stat"`
}

type listClassResponse struct {
	Classes []listClassResponseData `json:"classes"`
}

func (h *Handler) ListClass(c *gin.Context) {
	classes := make([]listClassResponseData, 0, len(model.ClassConfigs))
	for name, cfg := range model.ClassConfigs {
		classes = append(classes, listClassResponseData{
			Name:        string(name),
			Subname:     cfg.Subname,
			PrimaryStat: cfg.PrimaryStat,
		})
	}

	sort.Slice(classes, func(i, j int) bool {
		return classes[i].Name < classes[j].Name
	})

	slog.Info("list class configs success", "x-ref-id", app.RefID(c))
	app.ReturnSuccess(c, listClassResponse{
		Classes: classes,
	})
}
