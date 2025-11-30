# CrewOrkanizer - Quick Start

## 🚀 In 5 Minuten starten

### 1. Voraussetzungen prüfen
```bash
docker --version
docker-compose --version
```

### 2. Projekt entpacken
```bash
tar -xzf creworkanizer.tar.gz
cd creworkanizer
```

### 3. Services starten
```bash
docker-compose up -d
```

### 4. Dependencies installieren
```bash
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

### 5. Fertig! 🎉

Öffnen Sie Ihren Browser:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **RabbitMQ UI**: http://localhost:15672 (User: crewuser, Pass: crewpass123)

## 📝 Ersten Benutzer anlegen

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@creworkanizer.de",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## 🛑 Stoppen

```bash
docker-compose down
```

## 📚 Vollständige Dokumentation

Siehe **CrewOrkanizer_Installation_Guide.docx** für Details.

## ⚡ Häufige Befehle

```bash
# Logs ansehen
docker-compose logs -f

# Container-Status
docker-compose ps

# In Backend-Container
docker-compose exec backend sh

# Datenbank-Backup
docker-compose exec postgres pg_dump -U crewuser creworkanizer > backup.sql
```

## 🔧 Probleme?

1. Prüfen Sie die Logs: `docker-compose logs`
2. Container neu starten: `docker-compose restart`
3. Konsultieren Sie die vollständige Installations-Anleitung
