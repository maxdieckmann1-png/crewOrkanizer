# 🎪 CrewOrkanizer

> **Event Crew Management System** - Moderne Full-Stack Applikation für Event-Personal-Verwaltung

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/maxdieckmann1-png/crewOrkanizer)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## ✨ Features

### 🎯 Kern-Funktionen
- ✅ **Event Management** - Erstellen, Bearbeiten, Verwalten von Events
- ✅ **Schicht-Planung** - Flexible Schicht-Verwaltung mit automatischer Zuweisung
- ✅ **Bewerbungs-System** - Priorisierte Bewerbungen mit Management-Review
- ✅ **Dashboard** - Übersichtliche Statistiken und Zusammenfassungen
- ✅ **RBAC System** - Rollen-basierte Zugriffskontrolle (Admin, Management, Employee)
- ✅ **Auto-Assignment** - Automatische Zuweisung bei Genehmigung

### 💎 UX Features (NEU in V1.0)
- ✨ **Toast Notifications** - Sofortiges Feedback für Benutzeraktionen
- ✨ **Confirm Dialogs** - Sichere Bestätigungen für kritische Aktionen
- ✨ **Loading States** - Professionelle Loading-Indikatoren
- ✨ **Responsive Design** - Optimiert für Desktop, Tablet & Mobile

### 🔐 Sicherheit
- 🔒 **JWT Authentication** - Sichere Token-basierte Authentifizierung
- 🔒 **Refresh Tokens** - Automatische Token-Erneuerung
- 🔒 **Password Hashing** - Bcrypt mit Salt
- 🔒 **Role Guards** - Endpoint-basierte Zugriffskontrolle

## 🚀 Schnellstart (1 Befehl!)

```bash
curl -fsSL https://raw.githubusercontent.com/maxdieckmann1-png/crewOrkanizer/main/install-creworkanizer-github.sh | sudo bash
```

**Das war's!** 🎉 Öffne http://localhost:5173

## 📊 Technologie-Stack

### Backend
- **NestJS** - Enterprise-grade Node.js Framework
- **TypeScript** - Type-safe Development
- **PostgreSQL** - Relationale Datenbank
- **Redis** - Caching & Session Management
- **RabbitMQ** - Message Queue
- **JWT** - Authentication
- **TypeORM** - Object-Relational Mapping

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router 6** - Navigation
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **React-Toastify** - Notifications

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-Container Orchestration
- **NGINX** - Reverse Proxy
- **Let's Encrypt** - SSL Certificates

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX                                │
│                   Reverse Proxy                             │
│                  (Port 80/443)                              │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Frontend           │      │   Backend API        │
│   React + Vite       │      │   NestJS             │
│   Port 5173          │      │   Port 3000          │
└──────────────────────┘      └──────┬───────────────┘
                                     │
         ┌───────────────────────────┼───────────────────┐
         │                           │                   │
         ▼                           ▼                   ▼
┌────────────────┐      ┌────────────────┐   ┌──────────────┐
│  PostgreSQL    │      │     Redis      │   │  RabbitMQ    │
│  Port 5432     │      │   Port 6379    │   │  Port 5672   │
└────────────────┘      └────────────────┘   └──────────────┘
```

## 📦 Installation

### Voraussetzungen
- Linux Server (Debian/Ubuntu empfohlen)
- Root oder sudo Zugriff
- Mindestens 5GB freier Speicher

### Methode 1: Automatisches Script (Empfohlen)

```bash
# Download & Execute
curl -fsSL https://raw.githubusercontent.com/maxdieckmann1-png/crewOrkanizer/main/install-creworkanizer-github.sh | sudo bash
```

Das Script installiert automatisch:
- ✅ Docker & Docker Compose (falls nicht vorhanden)
- ✅ Alle 6 Container
- ✅ Sichere Passwörter
- ✅ Netzwerk-Konfiguration

### Methode 2: Manuell

```bash
# 1. Repository klonen
git clone https://github.com/maxdieckmann1-png/crewOrkanizer.git
cd crewOrkanizer

# 2. Environment-Variablen erstellen
cat > .env << EOF
DATABASE_PASSWORD=$(openssl rand -base64 20)
RABBITMQ_PASSWORD=$(openssl rand -base64 20)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
EOF

# 3. Container starten
docker compose up -d
```

## 🎮 Verwendung

### Erste Schritte

1. **Registrieren**: http://localhost:5173/register
2. **Login**: Mit deinen Credentials einloggen
3. **Dashboard**: Übersicht über alle Events & Schichten

### Employee Workflow

```
Registrieren → Login → Available Shifts durchsuchen 
  → Bewerben (mit Priorität) → Genehmigung erhalten 
  → My Shifts ansehen → Zur Schicht erscheinen
```

### Management Workflow

```
Login → Event erstellen → Schichten erstellen 
  → Bewerbungen prüfen → Genehmigen/Ablehnen 
  → Auto-Zuweisung → Event Stats überwachen
```

## 📱 API Endpoints

### Authentication
```
POST   /api/v1/auth/register      - Account registrieren
POST   /api/v1/auth/login         - Einloggen
POST   /api/v1/auth/refresh       - Token erneuern
POST   /api/v1/auth/logout        - Ausloggen
```

### Events (35 Endpoints total)
```
GET    /api/v1/events             - Alle Events (mit Filter)
GET    /api/v1/events/:id         - Event Details
POST   /api/v1/events             - Event erstellen (Management)
PATCH  /api/v1/events/:id         - Event bearbeiten (Management)
DELETE /api/v1/events/:id         - Event löschen (Management)
PATCH  /api/v1/events/:id/status  - Status ändern (Management)
GET    /api/v1/events/:id/stats   - Event Statistiken (Management)
```

### Shifts
```
GET    /api/v1/shifts             - Alle Schichten
GET    /api/v1/shifts/available   - Verfügbare Schichten
GET    /api/v1/shifts/my-shifts   - Meine Schichten
POST   /api/v1/shifts/:id/apply   - Für Schicht bewerben
```

### Applications
```
GET    /api/v1/shifts/applications/pending  - Offene Bewerbungen (Management)
PATCH  /api/v1/shifts/applications/:id      - Bewerbung prüfen (Management)
```

[➡️ Vollständige API Dokumentation](docs/API_DOCUMENTATION.md)

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Events Overview
![Events](docs/screenshots/events.png)

### Shift Application
![Apply](docs/screenshots/apply.png)

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm run test

# Frontend Tests
cd frontend
npm run test

# E2E Tests
npm run test:e2e
```

## 📊 Projekt-Status

| Modul | Status | Fortschritt |
|-------|--------|-------------|
| Backend API | ✅ Komplett | 100% |
| Frontend Pages | ✅ Komplett | 100% |
| UX Components | ✅ Komplett | 100% |
| Docker Setup | ✅ Komplett | 100% |
| Documentation | ✅ Komplett | 100% |
| Testing | 🔄 In Arbeit | 60% |
| Mobile App | ⏳ Geplant | 0% |

## 🗺️ Roadmap

### ✅ Version 1.0 (Aktuell)
- [x] Event Management
- [x] Shift Management
- [x] Application System
- [x] Dashboard
- [x] UX Components
- [x] Docker Deployment

### 🔄 Version 1.1 (Q1 2025)
- [ ] E-Mail Notifications
- [ ] Positions & Qualifications
- [ ] User Profile Page
- [ ] Advanced Filtering

### 📱 Version 2.0 (Q2 2025)
- [ ] React Native Mobile App
- [ ] Push Notifications
- [ ] Calendar Integration
- [ ] Real-time Updates (WebSocket)

### 🚀 Version 3.0 (Q3 2025)
- [ ] Advanced Analytics
- [ ] Reporting Dashboard
- [ ] Multi-Tenant Support
- [ ] API Rate Limiting

## 💻 Development

### Backend Development
```bash
cd backend
npm install
npm run start:dev

# API läuft auf http://localhost:3000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev

# Frontend läuft auf http://localhost:5173
```

### Database Migrations
```bash
cd backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 🤝 Contributing

Contributions sind willkommen! Bitte lesen Sie [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

### Development Setup
1. Fork das Repository
2. Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 👥 Team

- **Max Dieckmann** - *Initial work* - [@maxdieckmann1-png](https://github.com/maxdieckmann1-png)

## 🙏 Danksagungen

- NestJS Community
- React Community
- Docker Community
- Alle Contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/maxdieckmann1-png/crewOrkanizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/maxdieckmann1-png/crewOrkanizer/discussions)
- **Email**: support@creworkanizer.de

## ⭐ Gefällt dir das Projekt?

Gib uns einen Stern auf GitHub! Es hilft uns sehr! 🌟

---

**Gebaut mit ❤️ für die Event-Community**
