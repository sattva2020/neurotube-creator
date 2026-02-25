# --- Makefile for NeuroTube Creator ---
# Usage: make [target]

SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# --- Project ---
PROJECT  ?= neurotube-creator
NODE_ENV ?= development
PORT     ?= 3000

# --- Git ---
VERSION    ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT     ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME := $(shell date -u '+%Y-%m-%dT%H:%M:%SZ')

# --- Package Manager ---
PM  := npm
PMX := npx

# --- Docker ---
DOCKER_IMAGE ?= $(PROJECT)
DOCKER_TAG   ?= $(VERSION)

# ============================================================================
.DEFAULT_GOAL := help

##@ Development

.PHONY: install
install: ## Install dependencies
	$(PM) install

.PHONY: dev
dev: ## Start development server (port 3000)
	$(PM) run dev

.PHONY: build
build: ## Build for production
	$(PM) run build

.PHONY: preview
preview: ## Preview production build locally
	$(PM) run preview

##@ Code Quality

.PHONY: lint
lint: ## Run TypeScript type checking
	$(PM) run lint

.PHONY: check
check: lint build ## Run all checks (lint + build)

##@ Docker

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build \
		--build-arg VERSION=$(VERSION) \
		--build-arg COMMIT=$(COMMIT) \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG) \
		-t $(DOCKER_IMAGE):latest \
		.

.PHONY: docker-run
docker-run: ## Run Docker container locally (port 3000)
	docker run --rm -p $(PORT):$(PORT) \
		--env-file .env.local \
		$(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-stop
docker-stop: ## Stop running containers
	docker stop $$(docker ps -q --filter ancestor=$(DOCKER_IMAGE)) 2>/dev/null || true

.PHONY: docker-logs
docker-logs: ## Tail container logs
	docker logs -f $$(docker ps -q --filter ancestor=$(DOCKER_IMAGE))

.PHONY: docker-clean
docker-clean: ## Remove Docker images and stopped containers
	docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_IMAGE):latest 2>/dev/null || true
	docker system prune -f

##@ Deploy (Dokploy)

.PHONY: deploy
deploy: ## Deploy to Dokploy (requires DOKPLOY_URL and DOKPLOY_API_KEY)
	@if [ -z "$${DOKPLOY_URL:-}" ] || [ -z "$${DOKPLOY_API_KEY:-}" ]; then \
		echo "Error: Set DOKPLOY_URL and DOKPLOY_API_KEY environment variables"; \
		echo "  export DOKPLOY_URL=https://dokploy.example.com"; \
		echo "  export DOKPLOY_API_KEY=your-api-key"; \
		exit 1; \
	fi
	@echo "Deploying $(PROJECT) to Dokploy..."
	@echo "Use /dokploy-api-mcp or Dashboard to trigger deployment"

.PHONY: deploy-status
deploy-status: ## Check deployment status on Dokploy
	@if [ -z "$${DOKPLOY_URL:-}" ] || [ -z "$${DOKPLOY_API_KEY:-}" ]; then \
		echo "Error: Set DOKPLOY_URL and DOKPLOY_API_KEY"; exit 1; \
	fi
	@echo "Check status at: $${DOKPLOY_URL}"

##@ CI

.PHONY: ci
ci: install lint build ## Run full CI pipeline (install + lint + build)

##@ Cleanup

.PHONY: clean
clean: ## Remove build artifacts
	$(PM) run clean

.PHONY: clean-all
clean-all: clean ## Remove everything including node_modules
	rm -rf node_modules/

##@ Info

.PHONY: info
info: ## Show project info
	@echo "Project:  $(PROJECT)"
	@echo "Version:  $(VERSION)"
	@echo "Commit:   $(COMMIT)"
	@echo "Built:    $(BUILD_TIME)"
	@echo "Node:     $$(node -v)"
	@echo "npm:      $$(npm -v)"
	@echo "PM:       $(PM)"

##@ Help

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)}' $(MAKEFILE_LIST)
