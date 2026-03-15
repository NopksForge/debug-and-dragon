.PHONY: start stop frontend backend both kill-8080 kill-3000

BACKEND_DIR := Backend
FRONTEND_DIR := Frontend
PIDFILE := .pids

# Start both backend and frontend (background)
start: both

# Run backend only (foreground)
backend:
	cd $(BACKEND_DIR) && export $$(cat .env 2>/dev/null | grep -v '^\#' | xargs) && go run main.go

# Run frontend only (foreground)
frontend:
	cd $(FRONTEND_DIR) && npm run dev

# Run both in background; PIDs saved for 'make stop'
both:
	@echo "Starting backend..."
	@(cd $(BACKEND_DIR) && export $$(cat .env 2>/dev/null | grep -v '^\#' | xargs) && go run main.go) & echo $$! > $(PIDFILE).backend
	@echo "Starting frontend..."
	@(cd $(FRONTEND_DIR) && npm run dev) & echo $$! > $(PIDFILE).frontend
	@echo "Backend and frontend started. Use 'make stop' to stop."

# Stop backend and frontend (kills processes started by 'make both' or 'make start')
stop:
	@if [ -f $(PIDFILE).backend ]; then \
		kill $$(cat $(PIDFILE).backend) 2>/dev/null || true; \
		rm -f $(PIDFILE).backend; \
		echo "Backend stopped."; \
	fi
	@if [ -f $(PIDFILE).frontend ]; then \
		kill $$(cat $(PIDFILE).frontend) 2>/dev/null || true; \
		rm -f $(PIDFILE).frontend; \
		echo "Frontend stopped."; \
	fi

# Kill whatever is listening on port 8080 (backend)
kill-8080:
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true; echo "Killed process on port 8080."

# Kill whatever is listening on port 3000 (frontend)
kill-3000:
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true; echo "Killed process on port 3000."
