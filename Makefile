.PHONY: help install run dev build test test-watch preview mobile-sync

PNPM ?= pnpm

help:
	@echo "Frost — common targets:"
	@echo "  make run          Start dev server (default)"
	@echo "  make install      pnpm install"
	@echo "  make build        Production build"
	@echo "  make test         Run unit tests"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make preview      Preview production build"
	@echo "  make mobile-sync  Build web + cap sync (mobile/)"

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

mobile-sync:
	$(PNPM) build
	cd mobile && npm install && npm run copy

.DEFAULT_GOAL := run
