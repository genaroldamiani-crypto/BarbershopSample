# MANE — Barber Studio Website

A multi-page static website for a fictional barber studio. No build step, no
dependencies — just HTML, CSS, and vanilla JavaScript. Deploys to Vercel as-is.

## Pages

| File           | Tab       | What's on it                                            |
| -------------- | --------- | ------------------------------------------------------- |
| `index.html`   | Home      | Hero, studio story, stats                               |
| `services.html`| Services  | The menu — click a service to start a booking           |
| `barbers.html` | Barbers   | The team, lookbook, reviews                             |
| `book.html`    | Book      | 4-step booking wizard + saved appointments              |
| `contact.html` | Contact   | Hours, location, FAQ, enquiry form                      |

Shared styling lives in `assets/styles.css`; shared behaviour (nav, booking,
form, cross-page selection) lives in `assets/app.js`.

## Run locally

It's static, so just open `index.html` in a browser. For clean local URLs you
can optionally serve it:

```bash
npx serve .
```

## Deploy to Vercel via GitHub

1. **Create a GitHub repo** and push this folder:

   ```bash
   git remote add origin https://github.com/<your-username>/mane-site.git
   git branch -M main
   git push -u origin main
   ```

   (This folder is already a Git repo with an initial commit.)

2. **Import to Vercel:** go to <https://vercel.com/new>, pick the repo.
   - **Framework Preset:** Other
   - **Root Directory:** `./` (the repo root — this folder)
   - **Build Command:** leave empty
   - **Output Directory:** leave empty
   - Click **Deploy**.

3. Vercel gives you a live URL (e.g. `mane-site.vercel.app`). Every future
   `git push` to `main` redeploys automatically.

### Custom domain

In the Vercel project: **Settings → Domains → Add**, then point your domain's
DNS at Vercel as instructed.

## Notes

- `vercel.json` sets long-cache headers on `/assets` and basic security headers.
- Bookings and the contact form are demo-only (no backend) — they validate and
  confirm in the browser and persist bookings to `localStorage`. To make the
  contact form deliver email, wire it to a service like Formspree or a Vercel
  serverless function.
