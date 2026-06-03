.PHONY: help install run dev build test test-watch preview

PNPM ?= pnpm

help:
	@echo "Frost — common targets:"
	@echo "  make run          Start dev server (default)"
	@echo "  make install      pnpm install"
	@echo "  make build        Production build"
	@echo "  make test         Run unit tests"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make preview      Preview production build"

install:
	$(PNPM) install

run dev:
	$(PNPM) dev

build:
	$(PNPM) build

test:
	$(PNPM) test

test-watch:
	$(PNPM) run test:watch

preview:
	$(PNPM) preview

.DEFAULT_GOAL := run
