package race

type Handler struct {
}

type HandlerConfig struct {
}

func NewHandler(cfgs HandlerConfig) *Handler {
	return &Handler{}
}
