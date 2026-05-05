# Talla Quincaillerie

Talla Quincaillerie est une application de gestion complète pour une
quincaillerie avec activités de fabrication. Le système aide à gérer les ventes,
les stocks, les achats, la production, les clients, les finances, les employés
et les rapports depuis une interface simple en français.

## Fonctionnalités principales

## Tableau de bord

Le tableau de bord donne une vue rapide sur l'activité de la quincaillerie :

- chiffre d'affaires total ;
- valeur estimée du stock ;
- alertes de stock faible ;
- ordres de fabrication ouverts ;
- ventes récentes ;
- opérations en attente de synchronisation.

## Point de vente

Le module caisse permet de vendre rapidement au comptoir :

- recherche d'articles par nom, SKU ou code-barres ;
- ajout rapide des produits au panier ;
- calcul automatique du sous-total, de la TVA et du total ;
- choix du client ;
- paiement en espèces, Mobile Money, carte ou crédit client ;
- génération d'un ticket de caisse imprimable ;
- diminution automatique du stock après chaque vente.

## Gestion des stocks

Le système suit les mouvements de stock pour chaque article :

- consultation des quantités disponibles ;
- suivi du stock par article et par emplacement ;
- valorisation du stock ;
- alertes lorsque le stock atteint le seuil minimum ;
- ajustements manuels de stock ;
- historique des mouvements : ventes, achats, ajustements, fabrication.

## Fabrication

Le module fabrication permet de gérer les produits fabriqués par la
quincaillerie :

- création d'ordres de fabrication ;
- utilisation de nomenclatures ;
- consommation automatique des matières premières ;
- entrée automatique des produits finis en stock ;
- suivi du statut de chaque ordre de fabrication ;
- calcul du coût de production.

## Achats et fournisseurs

Le module achats permet d'enregistrer les réceptions fournisseurs :

- gestion des fournisseurs ;
- réception d'articles achetés ;
- mise à jour automatique du stock au dépôt ;
- enregistrement du coût d'achat ;
- historique des achats récents.

## Clients

Le système permet de gérer le portefeuille clients :

- création de nouveaux clients ;
- enregistrement du téléphone et de la limite de crédit ;
- suivi du solde estimé pour les ventes à crédit ;
- sélection du client lors de la vente.

## Finance et comptabilité

Le module finance fournit un suivi simplifié compatible avec une organisation
comptable de type OHADA :

- suivi des ventes comptabilisées ;
- suivi des achats comptabilisés ;
- journal simplifié des écritures ;
- export du journal en fichier CSV ;
- base de travail pour le comptable.

## Ressources humaines

Le module RH permet de suivre les employés et leur contribution à la production :

- liste des employés ;
- rôle ou poste de chaque employé ;
- taux horaire ;
- saisie des heures travaillées sur un ordre de fabrication ;
- calcul du coût de main-d'oeuvre lié à la production.

## Administration

Le module administration regroupe les paramètres essentiels :

- rôles utilisateurs ;
- accès par rôle ;
- sites et emplacements ;
- journal d'audit des actions importantes.

## Rôles utilisateurs

L'application propose plusieurs profils :

- Administrateur ;
- Caissier ;
- Gestionnaire de stock ;
- Responsable production ;
- Comptable ;
- Responsable RH.

Chaque rôle donne accès uniquement aux modules nécessaires à son travail.

## Fonctionnement hors ligne

Le système est conçu pour les environnements où la connexion internet peut être
instable :

- l'application peut fonctionner comme PWA ;
- les données sont conservées localement dans le navigateur ;
- les ventes et mouvements peuvent être enregistrés même sans connexion ;
- les opérations en attente sont placées dans une file de synchronisation ;
- la synchronisation peut être déclenchée lorsque la connexion revient.

## Lancement local

Dans le dossier du projet :

```powershell
node server.js
```

Puis ouvrir :

```text
http://localhost:4173
```

Si Node.js n'est pas dans le PATH, utiliser le chemin complet du Node fourni par
Codex :

```powershell
& "C:\Users\kamga\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

