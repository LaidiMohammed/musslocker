# MUSSLOCKER — Boutique Vêtements (style Wix Fashion 2114, rouge & noir)

Next.js + Tailwind + Supabase. Bilingue FR/AR. TikTok @musslocker intégré.

## Démarrage
```bash
npm install
npm run dev
```
Ouvre http://localhost:3000

## Fonctionnalités
- Accueil style template Wix sport 2114: hero, marquee, catégories, best-sellers, bannière TikTok
- Boutique `/shop` avec **bonne recherche**: Fuse.js instantané FR/AR + `/api/search` (Supabase ilike + full-text quand configuré), filtres catégorie/prix/tri
- Produit `/product/[slug]`: taille, couleur, quantité, bouton TikTok
- Panier (zustand, persisté) + Checkout `/checkout`: nom, prénom, téléphone DZ, wilaya (58), commune, adresse, notes
- Après commande: **ID 8 caractères** (nanoid, sans 0/O/1/I) + **QR code** avec infos commande (nom, tél, wilaya, total, articles) — page `/order/[code]` avec download/print
- Suivi `/suivi`: code 8 chars → statut + QR (local + Supabase)
- Admin `/admin` (code défaut `MUSS2024`, change via `NEXT_PUBLIC_ADMIN_CODE`): stats CA, kanban nouvelle→confirmée→expédiée→livrée/annulée, recherche/scan par code/tél/nom, CRUD modèles avec lien TikTok

## Supabase (optionnel mais recommandé pour prod)
1. Crée projet sur supabase.com
2. SQL Editor → colle `supabase/schema.sql` → Run
3. Storage → crée bucket public `products`
4. Auth → crée user admin → SQL: `insert into admins (user_id) values ('...')`
5. Copie `.env.example` vers `.env.local` et remplis les clés
6. Sans Supabase, le site marche en mode démo (produits démo + commandes localStorage)

## TikTok
Lien global: `https://www.tiktok.com/@musslocker`. TikTok bloque le scraping auto → dans `/admin` > Modèles, colle le lien de chaque vidéo dans le champ TikTok du produit. Envoie-moi photos + prix + noms pour remplacer les 8 démos.

## Deploy
- Vercel: import repo → ajoute env vars → deploy
- Supabase URL/keys en variables Vercel

## Scripts SQL utiles
Voir `supabase/schema.sql` (pg_trgm, tsvector, RLS, orders, order_items, admins).
