package charactor

import (
	"dndengine/app"
	"log/slog"

	"github.com/gin-gonic/gin"
)

type getCharacterRequest struct {
	ID string `uri:"id" binding:"required,uuid"`
}

type getCharacterResponse struct {
	ID    string           `json:"id"`
	Name  string           `json:"name"`
	Race  string           `json:"race"`
	Class string           `json:"class"`
	Stats app.StatResponse `json:"stats"`
}

func (h *Handler) GetCharacter(c *gin.Context) {
	var req getCharacterRequest
	if err := c.ShouldBindUri(&req); err != nil {
		slog.Error("failed to bind uri", "error", err.Error(), "x-ref-id", app.RefID(c))
		app.ReturnBadRequest(c)
		return
	}

	characterData, err := h.cache.Get(c, req.ID)
	if err != nil {
		slog.Error("failed to get character data from cache", "error", err, "x-ref-id", app.RefID(c))
		app.ReturnInternalError(c)
		return
	}

	if characterData == nil {
		slog.Info("character not found", "id", req.ID, "x-ref-id", app.RefID(c))
		app.ReturnNotFound(c)
		return
	}

	slog.Info("get character success", "id", req.ID, "x-ref-id", app.RefID(c))
	app.ReturnSuccess(c, getCharacterResponse{
		ID:    characterData.ID,
		Name:  characterData.Name,
		Race:  characterData.Race,
		Class: characterData.Class,
		Stats: characterData.Stats.ToResponse(),
	})
}
