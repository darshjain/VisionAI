# AI Camera Assistant - Production Makefile
# Comprehensive build, deployment, and management commands

.PHONY: help build up down restart logs clean install setup-dev setup-prod test lint format security-check backup restore monitor health-check update-models deploy-staging deploy-prod

# Default target
.DEFAULT_GOAL := help

# Configuration
COMPOSE_FILE := docker-compose.yml
COMPOSE_PROD_FILE := docker-compose.prod.yml
ENV_FILE := .env
BACKUP_DIR := backups
LOG_DIR := logs

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)AI Camera Assistant - Production Commands$(NC)"
	@echo "$(YELLOW)=====================================$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  make setup-dev    # Development setup"
	@echo "  make setup-prod   # Production setup"
	@echo "  make up           # Start all services"
	@echo "  make logs         # View logs"
	@echo ""

# Development Commands
setup-dev: ## Setup development environment
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then cp env.example $(ENV_FILE); fi
	@echo "$(GREEN)✓ Environment file created$(NC)"
	@make install-deps
	@make build
	@make pull-models
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@echo "$(YELLOW)Run 'make up' to start services$(NC)"

setup-prod: ## Setup production environment
	@echo "$(BLUE)Setting up production environment...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then cp env.example $(ENV_FILE); fi
	@sed -i 's/DEBUG_MODE=true/DEBUG_MODE=false/' $(ENV_FILE)
	@sed -i 's/LOG_LEVEL=DEBUG/LOG_LEVEL=INFO/' $(ENV_FILE)
	@make install-deps
	@make build-prod
	@make pull-models
	@echo "$(GREEN)✓ Production environment ready$(NC)"

install-deps: ## Install system dependencies
	@echo "$(BLUE)Installing system dependencies...$(NC)"
	@sudo apt-get update
	@sudo apt-get install -y curl wget jq ffmpeg portaudio19-dev python3-pyaudio
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Build Commands
build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --parallel
	@echo "$(GREEN)✓ Images built successfully$(NC)"

build-prod: ## Build production images
	@echo "$(BLUE)Building production images...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) build --parallel
	@echo "$(GREEN)✓ Production images built$(NC)"

build-no-cache: ## Build images without cache
	@echo "$(BLUE)Building images without cache...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --no-cache --parallel
	@echo "$(GREEN)✓ Images rebuilt$(NC)"

# Service Management
up: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@make health-check

up-prod: ## Start production services
	@echo "$(BLUE)Starting production services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_PROD_FILE) up -d
	@echo "$(GREEN)✓ Production services started$(NC)"
	@make health-check

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

down-volumes: ## Stop services and remove volumes
	@echo "$(BLUE)Stopping services and removing volumes...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✓ Services stopped and volumes removed$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

restart-service: ## Restart specific service (usage: make restart-service SERVICE=backend)
	@echo "$(BLUE)Restarting $(SERVICE) service...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart $(SERVICE)
	@echo "$(GREEN)✓ $(SERVICE) service restarted$(NC)"

# Monitoring and Logs
logs: ## View logs for all services
	@docker-compose -f $(COMPOSE_FILE) logs -f

logs-service: ## View logs for specific service (usage: make logs-service SERVICE=backend)
	@docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE)

monitor: ## Monitor system resources and services
	@echo "$(BLUE)Monitoring system resources...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop monitoring$(NC)"
	@while true; do \
		clear; \
		echo "$(CYAN)=== AI Camera Assistant Monitor ===$(NC)"; \
		echo ""; \
		echo "$(YELLOW)Service Status:$(NC)"; \
		docker-compose -f $(COMPOSE_FILE) ps; \
		echo ""; \
		echo "$(YELLOW)System Resources:$(NC)"; \
		docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"; \
		echo ""; \
		echo "$(YELLOW)GPU Usage:$(NC)"; \
		nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>/dev/null || echo "NVIDIA GPU not available"; \
		echo ""; \
		echo "$(YELLOW)Camera Devices:$(NC)"; \
		ls -la /dev/video* 2>/dev/null || echo "No camera devices found"; \
		echo ""; \
		echo "$(YELLOW)Audio Devices:$(NC)"; \
		arecord -l 2>/dev/null | head -5 || echo "No audio devices found"; \
		sleep 5; \
	done

health-check: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo "$(YELLOW)Backend API:$(NC)"
	@curl -s http://localhost:8000/ | jq . 2>/dev/null || echo "$(RED)✗ Backend not responding$(NC)"
	@echo "$(YELLOW)Ollama API:$(NC)"
	@curl -s http://localhost:11434/api/tags | jq .models[0].name 2>/dev/null || echo "$(RED)✗ Ollama not responding$(NC)"
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Frontend responding$(NC)" || echo "$(RED)✗ Frontend not responding$(NC)"
	@echo "$(YELLOW)Camera Status:$(NC)"
	@curl -s http://localhost:8000/camera/status | jq . 2>/dev/null || echo "$(RED)✗ Camera status unavailable$(NC)"
	@echo "$(YELLOW)LLM Status:$(NC)"
	@curl -s http://localhost:8000/llm/status | jq . 2>/dev/null || echo "$(RED)✗ LLM status unavailable$(NC)"

# Model Management
pull-models: ## Pull required AI models
	@echo "$(BLUE)Pulling AI models...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama pull llava:7b
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama pull whisper:latest
	@echo "$(GREEN)✓ Models pulled successfully$(NC)"

list-models: ## List available models
	@echo "$(BLUE)Available models:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama list

update-models: ## Update all models to latest versions
	@echo "$(BLUE)Updating models...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama pull llava:7b
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama pull whisper:latest
	@echo "$(GREEN)✓ Models updated$(NC)"

# Audio and Camera Setup
setup-camera: ## Setup camera permissions and devices
	@echo "$(BLUE)Setting up camera...$(NC)"
	@sudo usermod -a -G video $$USER
	@sudo chmod 666 /dev/video* 2>/dev/null || echo "No video devices found"
	@echo "$(GREEN)✓ Camera setup complete$(NC)"
	@echo "$(YELLOW)You may need to log out and back in for group changes to take effect$(NC)"

setup-audio: ## Setup audio devices and permissions
	@echo "$(BLUE)Setting up audio...$(NC)"
	@sudo usermod -a -G audio $$USER
	@sudo apt-get install -y pulseaudio pulseaudio-utils
	@echo "$(GREEN)✓ Audio setup complete$(NC)"
	@echo "$(YELLOW)You may need to log out and back in for group changes to take effect$(NC)"

test-camera: ## Test camera functionality
	@echo "$(BLUE)Testing camera...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera available:', cap.isOpened()); cap.release()"

test-audio: ## Test audio functionality
	@echo "$(BLUE)Testing audio...$(NC)"
	@arecord -d 2 -f cd test.wav && echo "$(GREEN)✓ Microphone working$(NC)" || echo "$(RED)✗ Microphone not working$(NC)"
	@aplay test.wav && echo "$(GREEN)✓ Speaker working$(NC)" || echo "$(RED)✗ Speaker not working$(NC)"
	@rm -f test.wav

# GPU Support
setup-gpu: ## Setup GPU support for CUDA
	@echo "$(BLUE)Setting up GPU support...$(NC)"
	@if command -v nvidia-smi >/dev/null 2>&1; then \
		echo "$(GREEN)✓ NVIDIA GPU detected$(NC)"; \
		docker-compose -f $(COMPOSE_FILE) exec ollama ollama run llava:7b "test" --gpu; \
	else \
		echo "$(YELLOW)⚠ No NVIDIA GPU detected$(NC)"; \
	fi

check-gpu: ## Check GPU availability and usage
	@echo "$(BLUE)GPU Status:$(NC)"
	@nvidia-smi --query-gpu=name,driver_version,memory.total,memory.used,utilization.gpu --format=csv,noheader,nounits 2>/dev/null || echo "$(RED)✗ NVIDIA GPU not available$(NC)"

# Testing and Quality Assurance
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -m pytest tests/ -v
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm test -- --coverage --watchAll=false

test-integration: ## Run integration tests
	@echo "$(BLUE)Running integration tests...$(NC)"
	@make health-check
	@curl -X POST http://localhost:8000/camera/start -H "Content-Type: application/json" -d '{"width":640,"height":480,"fps":30}'
	@curl -X POST http://localhost:8000/camera/stop
	@echo "$(GREEN)✓ Integration tests passed$(NC)"

lint: ## Run linting on all code
	@echo "$(BLUE)Running linting...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -m flake8 .
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm run lint

format: ## Format all code
	@echo "$(BLUE)Formatting code...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -m black .
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm run format

security-check: ## Run security checks
	@echo "$(BLUE)Running security checks...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -m bandit -r .
	@docker-compose -f $(COMPOSE_FILE) exec frontend npm audit

# Backup and Restore
backup: ## Create backup of application data
	@echo "$(BLUE)Creating backup...$(NC)"
	@mkdir -p $(BACKUP_DIR)
	@docker-compose -f $(COMPOSE_FILE) exec ollama tar -czf /tmp/ollama-backup.tar.gz /root/.ollama
	@docker cp $$(docker-compose -f $(COMPOSE_FILE) ps -q ollama):/tmp/ollama-backup.tar.gz $(BACKUP_DIR)/ollama-$$(date +%Y%m%d-%H%M%S).tar.gz
	@cp $(ENV_FILE) $(BACKUP_DIR)/env-$$(date +%Y%m%d-%H%M%S).backup
	@echo "$(GREEN)✓ Backup created in $(BACKUP_DIR)/$(NC)"

restore: ## Restore from backup (usage: make restore BACKUP=backup-file.tar.gz)
	@echo "$(BLUE)Restoring from backup...$(NC)"
	@docker cp $(BACKUP_DIR)/$(BACKUP) $$(docker-compose -f $(COMPOSE_FILE) ps -q ollama):/tmp/restore.tar.gz
	@docker-compose -f $(COMPOSE_FILE) exec ollama tar -xzf /tmp/restore.tar.gz -C /
	@echo "$(GREEN)✓ Backup restored$(NC)"

# Deployment
deploy-staging: ## Deploy to staging environment
	@echo "$(BLUE)Deploying to staging...$(NC)"
	@make build-prod
	@make up-prod
	@make health-check
	@echo "$(GREEN)✓ Staging deployment complete$(NC)"

deploy-prod: ## Deploy to production environment
	@echo "$(BLUE)Deploying to production...$(NC)"
	@make backup
	@make build-prod
	@make down
	@make up-prod
	@make health-check
	@echo "$(GREEN)✓ Production deployment complete$(NC)"

# Cleanup
clean: ## Clean up Docker resources
	@echo "$(BLUE)Cleaning up...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: ## Clean up all Docker resources including images
	@echo "$(BLUE)Cleaning up all resources...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	@docker system prune -af
	@echo "$(GREEN)✓ Complete cleanup done$(NC)"

# Development Utilities
shell-backend: ## Open shell in backend container
	@docker-compose -f $(COMPOSE_FILE) exec backend bash

shell-frontend: ## Open shell in frontend container
	@docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-ollama: ## Open shell in ollama container
	@docker-compose -f $(COMPOSE_FILE) exec ollama sh

# Performance and Optimization
optimize: ## Optimize application performance
	@echo "$(BLUE)Optimizing application...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec backend python -c "import gc; gc.collect()"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama optimize
	@echo "$(GREEN)✓ Optimization complete$(NC)"

benchmark: ## Run performance benchmarks
	@echo "$(BLUE)Running benchmarks...$(NC)"
	@time curl -X POST http://localhost:8000/camera/start -H "Content-Type: application/json" -d '{"width":640,"height":480,"fps":30}'
	@time curl -X POST http://localhost:8000/camera/stop
	@echo "$(GREEN)✓ Benchmarks complete$(NC)"

# Status and Information
status: ## Show comprehensive status information
	@echo "$(CYAN)=== AI Camera Assistant Status ===$(NC)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)Resources:$(NC)"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
	@echo ""
	@echo "$(YELLOW)Ports:$(NC)"
	@netstat -tlnp | grep -E ':(3000|8000|11434)' || echo "No services listening on required ports"
	@echo ""
	@echo "$(YELLOW)Environment:$(NC)"
	@if [ -f $(ENV_FILE) ]; then echo "$(GREEN)✓ Environment file exists$(NC)"; else echo "$(RED)✗ Environment file missing$(NC)"; fi
	@echo ""
	@echo "$(YELLOW)Access URLs:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Ollama:   http://localhost:11434"

# Quick Actions
quick-start: ## Quick start for development
	@make setup-dev
	@make up
	@echo "$(GREEN)✓ Quick start complete!$(NC)"
	@echo "$(YELLOW)Access the application at: http://localhost:3000$(NC)"

quick-stop: ## Quick stop all services
	@make down
	@echo "$(GREEN)✓ All services stopped$(NC)"

quick-restart: ## Quick restart all services
	@make restart
	@make health-check
	@echo "$(GREEN)✓ Services restarted$(NC)"
