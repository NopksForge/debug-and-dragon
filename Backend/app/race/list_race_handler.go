package race

import (
	"dndengine/app"
	"dndengine/app/race/model"
	"log/slog"
	"sort"

	"github.com/gin-gonic/gin"
)

type listRaceResponseData struct {
	Name        string           `json:"name"`
	StatBonuses app.StatResponse `json:"stat_bonuses"`
}

type listRaceResponse struct {
	Races []listRaceResponseData `json:"races"`
}

func (h *Handler) ListRace(c *gin.Context) {

	races := make([]listRaceResponseData, 0, len(model.RaceConfigs))
	for r, traits := range model.RaceConfigs {
		races = append(races, listRaceResponseData{
			Name:        string(r),
			StatBonuses: traits.Bonuses.ToResponse(),
		})
	}

	sort.Slice(races, func(i, j int) bool {
		return races[i].Name < races[j].Name
	})

	slog.Info("list race configs success", "x-ref-id", app.RefID(c))
	app.ReturnSuccess(c, listRaceResponse{
		Races: races,
	})
}
