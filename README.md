# Talla Quincaillerie

Application de gestion complète pour Talla Quincaillerie, avec vente au
comptoir, gestion de stock, achats, fabrication, finance, RH et fonctionnement
offline-first multi-sites.

## Source Material Reviewed

- `C:\Users\kamga\Downloads\cahier_des_charges_quincaillerie.docx`
- `C:\Users\kamga\Downloads\systeme_gestion_quincaillerie.docx`
- `https://chatgpt.com/s/t_69f9ff4ef46881918f47fe277326d117`

The shared ChatGPT architecture link was not accessible from the current
execution environment, so the architecture below is derived from the two Word
documents plus standard production patterns for offline-first retail systems.

## Extracted Requirements

The documents require an integrated management system for a hardware store with
manufacturing activities. The system must cover stock, production, sales,
purchasing, accounting, HR, and reporting. It must be a web application with
offline PWA support, security controls, performance suitable for SMEs, local
database plus cloud synchronization, and support for unstable internet
connections. It must support the following user profiles: Administrator, stock
manager, production manager, cashier, accountant, and HR manager. Accounting
must be compatible with OHADA constraints.

## Deliverables

- [System Architecture](docs/architecture.md)
- [Functional Modules](docs/functional-modules.md)
- [Database Schema](docs/database-schema.sql)
- [REST API and Sync Specification](docs/openapi.yaml)
- [Implementation and Deployment Guide](docs/implementation-guide.md)
- [Environment Template](.env.example)
- [Docker Compose Template](docker-compose.yml)

## Application développée

Une première version complète et exploitable de l'application est fournie en
français :

- `index.html` : interface principale.
- `assets/app.js` : logique métier offline-first, POS, stock, fabrication,
  achats, clients, finance, RH, rôles, audit et synchronisation différée.
- `assets/styles.css` : design responsive.
- `manifest.webmanifest` et `service-worker.js` : installation PWA et cache
  hors ligne.
- `server.js` : serveur local sans dépendance npm.

## Lancement local

Avec Node.js :

```bash
node server.js
```

Puis ouvrir :

```text
http://localhost:4173
```

Identifiants de démonstration : aucun mot de passe n'est requis dans cette
version locale. Utilisez le sélecteur de rôle en haut à droite pour tester les
profils Administrateur, Caissier, Gestionnaire de stock, Production,
Comptable et RH.
