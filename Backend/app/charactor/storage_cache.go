package charactor

import (
	"context"
	"dndengine/app/charactor/model"
	"encoding/json"

	"github.com/redis/go-redis/v9"
)

type storageCache struct {
	cache *redis.Client
}

func NewStorageCache(cache *redis.Client) *storageCache {
	return &storageCache{
		cache: cache,
	}
}

const PREFIX_CHARACTER = "CHARACTER:"

func (s *storageCache) Set(ctx context.Context, characterData model.CharacterData) error {
	data, err := json.Marshal(characterData)
	if err != nil {
		return err
	}
	return s.cache.Set(ctx, PREFIX_CHARACTER+characterData.ID, data, 0).Err()
}

func (s *storageCache) Get(ctx context.Context, id string) (*model.CharacterData, error) {
	var characterData model.CharacterData

	data, err := s.cache.Get(ctx, PREFIX_CHARACTER+id).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	err = json.Unmarshal([]byte(data), &characterData)
	if err != nil {
		return nil, err
	}
	return &characterData, nil
}

func (s *storageCache) Del(ctx context.Context, id string) error {
	return s.cache.Del(ctx, PREFIX_CHARACTER+id).Err()
}
