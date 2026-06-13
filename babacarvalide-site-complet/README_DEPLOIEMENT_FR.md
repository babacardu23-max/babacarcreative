# Portfolio Babacarvalide — Export complet et déploiement

## Contenu de cette archive

Cette archive contient le code source complet du site :
- interface publique du portfolio ;
- studio créatif administrateur ;
- fonctions serveur ;
- structure et migrations de la base de données ;
- configuration TanStack Start, React, Tailwind CSS et Vite ;
- références aux médias du projet.

Les mots de passe, clés privées et le fichier `.env` ne sont volontairement pas inclus. Ne partagez jamais ces secrets dans une archive ou sur GitHub.

## Option recommandée : publier gratuitement avec Lovable

1. Ouvrez le projet dans Lovable.
2. Cliquez sur **Publish** en haut à droite.
3. Le site obtient gratuitement une adresse de type `nom-du-site.lovable.app`.
4. Après chaque modification visuelle, ouvrez de nouveau **Publish**, puis cliquez sur **Update**.

Cette option conserve automatiquement la base de données, le stockage des images et le studio administrateur.

## À propos d’un « vrai nom de domaine gratuit »

Un domaine personnel comme `.com`, `.fr`, `.sn` ou `.net` n’est normalement pas gratuit : il doit être acheté et renouvelé chaque année. Lovable ne fournit pas de domaine personnalisé gratuit. L’adresse gratuite `*.lovable.app` est déjà un sous-domaine public permanent.

Pour connecter plus tard un domaine acheté :
1. Le projet doit d’abord être publié.
2. Un plan Lovable payant est nécessaire pour connecter un domaine personnalisé.
3. Allez dans **Project Settings → Project → Domains**.
4. Choisissez **Connect Domain** et suivez les instructions DNS.

Documentation officielle : https://docs.lovable.dev/features/custom-domain

## Sauvegarder le code sur GitHub

1. Dans Lovable, cliquez sur le bouton **+** de la zone de chat.
2. Choisissez **GitHub → Connect project**.
3. Autorisez GitHub et créez le dépôt.
4. Le code restera synchronisé automatiquement entre Lovable et GitHub.
5. Sur GitHub, utilisez **Code → Download ZIP** pour télécharger une nouvelle copie.

Documentation officielle : https://docs.lovable.dev/integrations/github

## Lancer le site sur un ordinateur

Prérequis : Bun ou Node.js récent.

```bash
bun install
bun run dev
```

Puis ouvrez l’adresse indiquée dans le terminal.

## Variables d’environnement

Le site utilise un backend géré et nécessite ses variables d’environnement pour les données, les images et le studio admin. Sur une autre plateforme d’hébergement, ces variables doivent être configurées dans les paramètres privés de la plateforme. Ne les écrivez jamais directement dans le code et ne publiez jamais le code confidentiel administrateur.

Variables attendues par l’application :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ACCESS_CODE`

Important : certaines clés serveur du backend géré ne sont pas exportables depuis Lovable Cloud. Pour garder le studio et le stockage pleinement fonctionnels sans migration technique, publiez directement avec Lovable.

## Déploiement externe

Le site est une application TanStack Start avec logique serveur : ce n’est pas un simple dossier HTML statique. Un hébergeur externe doit prendre en charge les fonctions serveur et les variables privées. La méthode la plus sûre est :
1. synchroniser le projet avec GitHub ;
2. suivre le guide d’auto-hébergement officiel ;
3. configurer un backend compatible et toutes les variables privées ;
4. vérifier la connexion admin, l’envoi d’images et la gestion des projets avant la mise en ligne.

Guide officiel : https://docs.lovable.dev/tips-tricks/self-hosting

## Sécurité

- Changez le code administrateur s’il a été partagé publiquement.
- Ne placez jamais `.env` dans GitHub.
- Ne publiez jamais de clé serveur.
- Faites une sauvegarde CSV des tables depuis **Cloud → Database → Tables** si nécessaire.
