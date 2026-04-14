# Mini DevOps Todo App

Application Todo complete:
- Backend Node.js + Express
- API REST securisee par JWT
- Base de donnees MySQL
- Frontend simple en HTML/CSS/JS

## Fonctionnalites

- Inscription utilisateur
- Connexion utilisateur
- Creation de taches avec une date
- Liste des taches de l'utilisateur connecte
- Filtre des taches par date
- Marquer une tache terminee / reouverte
- Suppression d'une tache

## Structure

- `app/app.js` : serveur Express
- `app/controller/authController.js` : inscription/connexion
- `app/controller/taskController.js` : CRUD taches
- `app/middleware/authMiddleware.js` : verification JWT
- `app/config/db.js` : connexion MySQL
- `app/public/` : frontend
- `sql/schema.sql` : schema MySQL
- `docker-compose.yml` : lancement app + mysql

## Variables d'environnement

Copier `.env.example` en `.env` puis ajuster:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

## Lancement local (sans Docker)

1. Installer les dependances:

```bash
npm install
```

2. Creer la base et les tables avec `sql/schema.sql` dans votre MySQL local.

3. Demarrer l'app:

```bash
npm start
```

4. Ouvrir:

- `http://localhost:3000`

## Lancement avec Docker Compose

```bash
docker compose up --build
```

Puis ouvrir `http://localhost:3000`.

## Endpoints API

### Auth

- `POST /api/auth/register`
  - body: `{ "name": "Alice", "email": "alice@mail.com", "password": "secret" }`

- `POST /api/auth/login`
  - body: `{ "email": "alice@mail.com", "password": "secret" }`
  - reponse: token JWT + user

### Tasks (Bearer token requis)

- `GET /api/tasks`
- `GET /api/tasks?date=2026-04-14`
- `POST /api/tasks`
  - body: `{ "title": "Acheter du lait", "dueDate": "2026-04-14" }`
- `PUT /api/tasks/:id`
  - body possible: `{ "title": "...", "dueDate": "2026-04-15", "isCompleted": true }`
- `DELETE /api/tasks/:id`
