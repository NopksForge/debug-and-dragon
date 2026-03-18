package charactor

import (
	"dndengine/app"
	"dndengine/app/charactor/model"
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type createCharacterRequest struct {
	Name  string          `json:"name" binding:"required"`
	Race  string          `json:"race" binding:"required"`
	Class string          `json:"class" binding:"required"`
	Stats app.StatRequest `json:"stats" binding:"required"`
}

type createCharacterResponse struct {
	ID string `json:"id"`
}

func (h *Handler) CreateCharacter(c *gin.Context) {
	var req createCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("failed to bind json", "error", err, "x-ref-id", app.RefID(c))
		app.ReturnBadRequest(c)
		return
	}

	id := uuid.New().String()
	if err := h.cache.Set(c, model.CharacterData{
		ID:    id,
		Name:  req.Name,
		Race:  req.Race,
		Class: req.Class,
		Stats: req.Stats.ToStat(),
	}); err != nil {
		slog.Error("failed to set character data to cache", "error", err, "x-ref-id", app.RefID(c))
		app.ReturnInternalError(c)
		return
	}

	slog.Info("create character success", "id", id, "x-ref-id", app.RefID(c))
	app.ReturnSuccess(c, createCharacterResponse{
		ID: id,
	})
}
