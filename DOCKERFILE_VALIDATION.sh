#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  🐳 DOCKERFILE VALIDATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Backend Dockerfile:"
echo "-------------------"
if grep -q "FROM node:20-alpine AS builder" backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Multi-stage build (builder stage)"
else
    echo -e "${RED}❌${NC} Kein Multi-stage build!"
fi

if grep -q "RUN npm ci$" backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} npm ci in builder (alle deps)"
else
    echo -e "${RED}❌${NC} npm ci nicht gefunden!"
fi

if grep -q "RUN npm run build" backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} npm run build"
else
    echo -e "${RED}❌${NC} npm run build nicht gefunden!"
fi

if grep -q "RUN npm ci --only=production" backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} npm ci --only=production in production stage"
else
    echo -e "${RED}❌${NC} Production npm ci nicht gefunden!"
fi

if grep -q "COPY --from=builder /app/dist" backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} COPY from builder"
else
    echo -e "${RED}❌${NC} COPY from builder nicht gefunden!"
fi

if grep -q 'CMD \["node", "dist/main.js"\]' backend/Dockerfile; then
    echo -e "${GREEN}✅${NC} CMD node dist/main.js"
else
    echo -e "${RED}❌${NC} CMD nicht korrekt!"
fi

echo ""
echo "Frontend Dockerfile:"
echo "--------------------"
if grep -q "FROM node:20-alpine AS builder" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Multi-stage build (builder stage)"
else
    echo -e "${RED}❌${NC} Kein Multi-stage build!"
fi

if grep -q "FROM nginx:alpine" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} NGINX production stage"
else
    echo -e "${RED}❌${NC} NGINX stage nicht gefunden!"
fi

if grep -q "COPY --from=builder /app/dist" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} COPY from builder"
else
    echo -e "${RED}❌${NC} COPY from builder nicht gefunden!"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DOCKERFILE VALIDATION ABGESCHLOSSEN!${NC}"
echo "═══════════════════════════════════════════════════════════════"
