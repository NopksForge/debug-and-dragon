package class

type Handler struct {
}

type HandlerConfig struct {
}

func NewHandler(cfgs HandlerConfig) *Handler {
	return &Handler{}
}
