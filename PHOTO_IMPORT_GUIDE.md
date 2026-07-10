# Legacy Photo Import Guide

The current public version of Saban Draft IQ does **not** use player photos during gameplay. It uses a draft-night helmet reveal instead.

Keep this guide only if you later decide to bring back a private photo mode with manually approved Alabama-uniform images.

Use this when you have manually approved Alabama-uniform player photos.

## The Simple Workflow

1. Put JPG or JPEG photos into this folder:

```text
photo-drop/
```

2. Name each photo using either the player ID or the player name.

Good examples:

```text
julio-jones.jpg
Julio Jones.jpeg
derrick-henry.jpg
Patrick Surtain II.jpg
```

3. Run:

```bash
npm run import-images
```

4. Then check what is still missing:

```bash
npm run audit-images
```

## Important Rules

- Use Alabama-uniform photos only.
- Use real photos of the correct player only.
- Do not use NFL headshots, high-school photos, combine photos, or unrelated images.
- Use JPG/JPEG files for now.
- The import command copies photos into `public/players/` with the exact filename the game expects.

## Current Missing Files

See `PLAYER_IMAGE_CHECKLIST.md` for the full checklist.
