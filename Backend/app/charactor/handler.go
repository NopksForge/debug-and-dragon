package charactor

import (
	"context"
	"dndengine/app/charactor/model"
)

type Handler struct {
	cache StorageCache
}

type HandlerConfig struct {
	Cache StorageCache
}

func NewHandler(cfgs HandlerConfig) *Handler {
	return &Handler{
		cache: cfgs.Cache,
	}
}

type StorageCache interface {
	Set(ctx context.Context, characterData model.CharacterData) error
	Get(ctx context.Context, id string) (*model.CharacterData, error)
	Del(ctx context.Context, id string) error
}
