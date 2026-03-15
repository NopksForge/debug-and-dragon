package config

import (
	"log/slog"
	"strings"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	Server         Server
	AccessControl  AccessControl
	Cache          Cache
	RefIDHeaderKey string `env:"REF_ID_HEADER_KEY"`
}

type Server struct {
	Hostname string `env:"HOSTNAME"`
	Port     string `env:"PORT,notEmpty"`
}

type AccessControl struct {
	AllowOrigin string `env:"ACCESS_CONTROL_ALLOW_ORIGIN"`
}

type Cache struct {
	RedisURL string `env:"REDIS_URL"`
}

func C() Config {
	config := Config{}
	err := env.Parse(&config)
	if err != nil {
		slog.Error("Failed to parse environment variables: " + err.Error())
	}
	// Normalize port (e.g. "tcp/8080" -> "8080") so Listen works on all platforms
	config.Server.Port = normalizePort(config.Server.Port)
	return config
}

func normalizePort(p string) string {
	p = strings.TrimSpace(p)
	if idx := strings.LastIndex(p, "/"); idx >= 0 && idx < len(p)-1 {
		return strings.TrimSpace(p[idx+1:])
	}
	return p
}
