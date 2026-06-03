# Decap CMS Setup (Cloudflare Pages + GitHub)

This project uses Decap CMS at `/admin`.

## 1) OAuth for GitHub login
Cloudflare Pages needs an OAuth proxy for Decap CMS.
Use the official Cloudflare Worker template:
- https://github.com/decaporg/decap-cms-oauth-cloudflare-worker

Follow that repo's README to deploy the Worker and configure GitHub OAuth.

## 2) Update `admin/config.yml`
After your Worker is live, set these values in `admin/config.yml`:

```yml
backend:
  name: github
  repo: sararr25/sararuffini
  branch: main
  base_url: https://<your-worker-domain>
  auth_endpoint: auth
```

## 3) Open the CMS
- URL: `https://<your-site-domain>/admin/`
- Login with GitHub
- Edit project page content from the visual forms

## 4) Where content is saved
- JSON files: `public/content/pages/*.json`
- Uploaded media: `public/assets/media/`

## References
- Decap docs: https://decapcms.org/docs/intro/
- Decap backends overview: https://decapcms.org/docs/backends-overview/
