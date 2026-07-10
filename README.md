# Saban Draft IQ

Saban Draft IQ is a mobile-first trivia game about Alabama players and the NFL Draft. Each round asks where five former Alabama stars began their NFL careers.

The public game uses an original mystery-player Draft Card rather than player photos, team logos, or official NFL and Alabama artwork.

## Local development

Install the project:

```bash
npm install
```

Run it locally:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

The production files are created in:

```bash
dist
```

## GitHub setup

1. Go to [GitHub](https://github.com).
2. Click **New repository**.
3. Name it `saban-draft-iq`.
4. Choose **Public** or **Private**.
5. Do not add a README, `.gitignore`, or license on GitHub if this project already has those files locally.
6. Click **Create repository**.

Then, in Terminal, from this project folder:

```bash
cd /Users/keith/saban-draft-iq
git init
git add .
git commit -m "Create Saban Draft IQ"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/saban-draft-iq.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Vercel deployment

1. Go to [Vercel](https://vercel.com).
2. Click **Add New Project**.
3. Import the `saban-draft-iq` GitHub repository.
4. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Click **Deploy**.

## Publishing future updates

After making changes locally:

```bash
git add .
git commit -m "Describe the update"
git push
```

Vercel will automatically publish the new version after GitHub receives the update.

## Current gameplay

- 30-player Alabama draft pool
- 5 random questions per round
- 10 points per correct answer
- 50 possible points
- Local best score and best streak
- Searchable NFL team answer field
- User-controlled answer-card reveal with draft facts
- Premium mystery-player Draft Card artwork
- Final results screen with share text

## Legacy photo tools

Older versions of the project used local player photos. The current public game no longer requires those images, but the helper files are still available if a photo mode is revisited:

```bash
npm run audit-images
npm run import-images
```

Those commands are optional and are not required for the current Draft Card game.
