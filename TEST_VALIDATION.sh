#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ REPOSITORY VALIDATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1 FEHLT!"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
    else
        echo -e "${RED}❌${NC} $1/ FEHLT!"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "ROOT Dateien:"
echo "-------------"
check_file "README.md"
check_file ".gitignore"
check_file "LICENSE"
check_file ".env.example"
check_file "install-creworkanizer-github.sh"
check_file "docker-compose.yml"

echo ""
echo "Backend:"
echo "--------"
check_dir "backend"
check_file "backend/Dockerfile"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/nest-cli.json"
check_dir "backend/src"

echo ""
echo "Frontend:"
echo "---------"
check_dir "frontend"
check_file "frontend/Dockerfile"
check_file "frontend/package.json"
check_dir "frontend/src"

echo ""
echo "NGINX:"
echo "------"
check_dir "nginx"
check_dir "nginx/conf.d"
check_file "nginx/conf.d/default.conf"

echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALLE CHECKS BESTANDEN!${NC}"
    echo "Repository ist vollständig und bereit für Upload!"
else
    echo -e "${RED}❌ $ERRORS FEHLER GEFUNDEN!${NC}"
    exit 1
fi
echo "═══════════════════════════════════════════════════════════════"
