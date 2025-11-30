# Claude Code Desktop Installation - Debian 12

## Auf deiner Debian 12 Maschine ausführen

### Option 1: Direkt-Installation (Empfohlen)

```bash
# 1. Node.js installieren (falls nicht vorhanden)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. Claude Code installieren
npm install -g @anthropic-ai/claude-code

# 3. Authentifizierung
claude auth login
# Browser öffnet sich -> Mit Anthropic Account anmelden

# 4. Projekt öffnen
cd /root  # oder dein Projektverzeichnis
git clone https://github.com/maxdieckmann1-png/crewOrkanizer.git
cd crewOrkanizer
git checkout claude/deploy-crew-organizer-mvp-01P7TRwiVviVP1jyULzEd7Ct

# 5. Claude Code starten
claude code .
```

### Option 2: Universal Install Script

```bash
# Installation Script herunterladen und ausführen
curl -fsSL https://storage.googleapis.com/anthropic-com/claude-code/install.sh | bash

# PATH aktualisieren
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Authentifizierung
claude auth login

# Projekt öffnen
cd /path/to/crewOrkanizer
claude code .
```

### Option 3: VS Code mit Claude Extension (Alternative)

```bash
# VS Code für Debian installieren
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'

apt-get update
apt-get install -y code

# VS Code starten
code /path/to/crewOrkanizer

# Dann in VS Code:
# - Extensions (Ctrl+Shift+X)
# - Suche "Claude Code" oder "Anthropic"
# - Installieren & Account verbinden
```

## Nach der Installation

Sobald Claude Code Desktop läuft, werde ich:
1. ✅ Docker & Docker Compose installieren
2. ✅ Alle 6 Container deployen
3. ✅ Services testen
4. ✅ Deployment verifizieren

## Troubleshooting

### Node.js Version prüfen
```bash
node --version  # Sollte >= 18.x sein
npm --version
```

### PATH-Problem
```bash
# Falls 'claude' nicht gefunden wird:
which claude
echo $PATH
source ~/.bashrc
```

### Bereits vorhanden?
```bash
# Check ob claude schon installiert ist
which claude
claude --version
```

## Nächste Schritte

Nach erfolgreicher Installation:
1. `cd` ins crewOrkanizer Verzeichnis
2. `claude code .` ausführen
3. In der Claude Code Session sagen: "Ich bin jetzt auf meiner Debian 12 Maschine verbunden"
4. Dann starte ich das Deployment! 🚀
