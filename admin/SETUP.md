# Sveltia CMS Authentication Setup (Cloudflare Pages + GitHub)

This project uses Sveltia CMS at `/admin`. Authentication supports GitHub OAuth and GitHub personal access token login.

## 1) OAuth for GitHub login
Cloudflare Pages needs an OAuth proxy for the CMS.

Use the official Sveltia Cloudflare Worker authenticator:
- https://github.com/sveltia/sveltia-cms-auth

## 2) Update `admin/config.yml`
The current live config can continue using the existing Decap-compatible OAuth Worker. To switch to the official Sveltia authenticator Worker, set these values in `admin/config.yml` and remove `auth_endpoint`:

```yml
backend:
  name: github
  repo: sararr25/sararuffini
  branch: main
  base_url: https://<your-sveltia-auth-worker-domain>
```

## 3) Token access
Sveltia CMS supports GitHub personal access token login without extra configuration. Leave token authentication enabled; do not add any setting that disables token login.

To sign in with a token:
- Open `https://<your-site-domain>/admin/`
- Click `Sign In with Token`
- Use the GitHub token-generation link shown by Sveltia so the required repository permissions are pre-selected
- Paste the generated token into the CMS prompt

Token access is useful for the site owner or a small technical team. OAuth through the Cloudflare Worker should remain the recommended login method for non-technical editors or multiple users.

## 4) Open the CMS
- URL: `https://<your-site-domain>/admin/`
- Login with GitHub OAuth, or with `Sign In with Token`
- Edit project page content from the visual forms

## 5) Where content is saved
- JSON files: `public/content/pages/*.json`
- Uploaded media: `public/assets/media/`

## References
- Sveltia GitHub backend: https://sveltiacms.app/en/docs/backends/github
- Sveltia CMS Authenticator: https://github.com/sveltia/sveltia-cms-auth
