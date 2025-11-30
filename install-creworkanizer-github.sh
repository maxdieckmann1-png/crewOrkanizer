#!/bin/bash

#═══════════════════════════════════════════════════════════════════
# CrewOrkanizer - GitHub Installation Script V4
# Mit: System Update, sudo/curl Auto-Install, Multi-OS Support
#═══════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_error() { echo -e "${RED}[FEHLER] $1${NC}"; }
print_success() { echo -e "${GREEN}[✓] $1${NC}"; }
print_info() { echo -e "${YELLOW}[INFO] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[⚠] $1${NC}"; }

# Root check
if [ "$EUID" -ne 0 ]; then
    print_error "Dieses Script muss als root ausgeführt werden!"
    echo "Bitte führen Sie aus: sudo bash $0"
    exit 1
fi

# Banner
echo -e "${BLUE}"
cat << "BANNER"
╔═══════════════════════════════════════════════════════════════╗
║                 CREWORKANIZER v1.0                           ║
║          Event Crew Management System                        ║
║          Vollautomatische GitHub Installation                ║
╚═══════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

# Installation URL
GITHUB_REPO="https://github.com/maxdieckmann1-png/crewOrkanizer.git"
INSTALL_DIR="$HOME/creworkanizer"

print_step "System-Vorbereitung"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    print_error "Kann Betriebssystem nicht erkennen!"
    exit 1
fi

print_info "Betriebssystem: $PRETTY_NAME"

# Install sudo if not present
if ! command -v sudo &> /dev/null; then
    print_warning "sudo ist nicht installiert. Installiere sudo..."
    if [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        apt-get update -qq
        apt-get install -y sudo
        print_success "sudo installiert"
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
        yum install -y sudo
        print_success "sudo installiert"
    else
        print_error "Kann sudo nicht automatisch installieren auf: $OS"
        exit 1
    fi
else
    print_success "sudo ist bereits installiert"
fi

# Install curl if not present
if ! command -v curl &> /dev/null; then
    print_warning "curl ist nicht installiert. Installiere curl..."
    if [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        apt-get update -qq
        apt-get install -y curl
        print_success "curl installiert"
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
        yum install -y curl
        print_success "curl installiert"
    else
        print_error "Kann curl nicht automatisch installieren auf: $OS"
        exit 1
    fi
else
    print_success "curl ist bereits installiert"
fi

# System update & upgrade
print_step "System-Update durchführen"

if [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
    print_info "APT Update & Upgrade..."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
    print_success "System aktualisiert"
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    print_info "YUM Update..."
    yum update -y
    print_success "System aktualisiert"
elif [ "$OS" = "fedora" ]; then
    print_info "DNF Update..."
    dnf update -y
    print_success "System aktualisiert"
else
    print_warning "Überspringe System-Update für: $OS"
fi

print_step "CrewOrkanizer Installation startet"
print_info "Repository: $GITHUB_REPO"
print_info "Zielverzeichnis: $INSTALL_DIR"
echo ""

# Check/Install Git
print_step "Git Installation prüfen"
if ! command -v git &> /dev/null; then
    print_warning "Git nicht gefunden - installiere Git..."
    if [ "$OS" = "debian" ] || [ "$OS" = "ubuntu" ]; then
        apt-get install -y git
        print_success "Git installiert via APT"
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y git
        print_success "Git installiert via YUM"
    elif [ "$OS" = "fedora" ]; then
        dnf install -y git
        print_success "Git installiert via DNF"
    else
        print_error "Kann Git nicht automatisch installieren auf: $OS"
        print_info "Bitte installieren Sie Git manuell"
        exit 1
    fi
else
    GIT_VERSION=$(git --version)
    print_success "Git bereits installiert: $GIT_VERSION"
fi

# Check/Install Docker
print_step "Docker Installation prüfen"
if ! command -v docker &> /dev/null; then
    print_warning "Docker nicht gefunden - installiere Docker..."
    print_info "Nutze offizielles Docker Install-Script..."
    curl -fsSL https://get.docker.com | sh
    
    # Start Docker
    if command -v systemctl &> /dev/null; then
        systemctl start docker
        systemctl enable docker
        print_success "Docker gestartet und auto-start aktiviert"
    else
        service docker start
        print_success "Docker gestartet"
    fi
    
    DOCKER_VERSION=$(docker --version)
    print_success "Docker installiert: $DOCKER_VERSION"
else
    DOCKER_VERSION=$(docker --version)
    print_success "Docker bereits installiert: $DOCKER_VERSION"
fi

# Check Docker Compose
DOCKER_COMPOSE=""
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    print_warning "Installiere Docker Compose..."
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    DOCKER_COMPOSE="docker-compose"
fi
print_success "Docker Compose: $DOCKER_COMPOSE"

# Create directory
if [ -d "$INSTALL_DIR" ]; then
    BACKUP_DIR="${INSTALL_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    print_warning "Backup erstellt: $BACKUP_DIR"
    mv "$INSTALL_DIR" "$BACKUP_DIR"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Clone repository
print_step "GitHub Repository klonen..."
git clone "$GITHUB_REPO" .
print_success "Repository geklont"

# Generate passwords
print_step "Sichere Passwörter generieren..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 20 | tr -d "=+/" | cut -c1-20)
RABBITMQ_PASSWORD=$(openssl rand -base64 20 | tr -d "=+/" | cut -c1-20)

# Create .env
cat > .env << ENVEOF
DATABASE_PASSWORD=$DB_PASSWORD
RABBITMQ_PASSWORD=$RABBITMQ_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ENVEOF
chmod 600 .env

# Save credentials
cat > .credentials.txt << CREDEOF
═══════════════════════════════════════════════════════════════
CREWORKANIZER - ZUGANGSDATEN
═══════════════════════════════════════════════════════════════

Datenbank:
  Host:     localhost:5432
  Database: creworkanizer
  User:     crewuser
  Password: $DB_PASSWORD

RabbitMQ:
  Host:     localhost:15672
  User:     crewuser
  Password: $RABBITMQ_PASSWORD

JWT Secrets:
  Access:  $JWT_SECRET
  Refresh: $JWT_REFRESH_SECRET

Generiert: $(date)
═══════════════════════════════════════════════════════════════
CREDEOF
chmod 600 .credentials.txt
print_success "Zugangsdaten gespeichert"

# Start containers
print_step "Docker Container starten..."
$DOCKER_COMPOSE up -d --build

print_info "Warte 20 Sekunden..."
sleep 20

# Get IP
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

# Success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 INSTALLATION ERFOLGREICH! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}✨ CrewOrkanizer V3 Features:${NC}"
echo -e "  ✅ 9 vollständige Pages"
echo -e "  ✅ Toast Notifications"
echo -e "  ✅ Confirm Dialogs"
echo -e "  ✅ Loading Spinners"
echo -e "  ✅ Event Detail & Create"
echo -e "  ✅ 35 API Endpoints"
echo ""
echo -e "${YELLOW}🌐 Zugriff:${NC}"
echo -e "  Frontend:   ${GREEN}http://localhost:5173${NC}"
echo -e "  Netzwerk:   ${GREEN}http://$SERVER_IP:5173${NC}"
echo -e "  Backend:    ${GREEN}http://localhost:3000/api/v1${NC}"
echo -e "  RabbitMQ:   ${GREEN}http://localhost:15672${NC}"
echo ""
echo -e "${YELLOW}🔑 Zugangsdaten:${NC}"
echo -e "  ${BLUE}cat $INSTALL_DIR/.credentials.txt${NC}"
echo ""
echo -e "${YELLOW}🐳 Container Verwaltung:${NC}"
echo -e "  Status:  ${BLUE}cd $INSTALL_DIR && $DOCKER_COMPOSE ps${NC}"
echo -e "  Logs:    ${BLUE}cd $INSTALL_DIR && $DOCKER_COMPOSE logs -f${NC}"
echo -e "  Stop:    ${BLUE}cd $INSTALL_DIR && $DOCKER_COMPOSE stop${NC}"
echo ""
echo -e "${YELLOW}🚀 Erste Schritte:${NC}"
echo -e "  1. Browser öffnen: ${GREEN}http://localhost:5173${NC}"
echo -e "  2. Account registrieren"
echo -e "  3. Login & Loslegen! 🎉"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
