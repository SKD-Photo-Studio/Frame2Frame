# ⚙️ Operations & Maintenance

## 🚀 Deployment Workflow

### Cloudflare Pages (Production)
The project is hosted on Cloudflare Pages. 
1. **Push to Development**: `git push origin main`
2. **Review**: Audit the PR or commit in the Dev Repo.
3. **Deploy**: Cloudflare auto-builds from the `main` branch.

### Mirror Sync
The `Mirror` repo (`SKD-Photo-Studio/Frame2Frame`) is your production source.
- **Manual Sync**: Run `git push mirror main` when you are ready to ship a stable version to the production repo.

---

## 🛠️ Essential Commands

| Task | Command |
| :--- | :--- |
| **Start Dev** | `npm run dev` |
| **Local Build** | `npm run build` |
| **Clean Install**| `npm run install:all` |
| **Wrangler Login**| `npx wrangler login` |

---

## 🛡️ Rollback Procedure

If production breaks:
1. **Force Revert**: Find the last stable SHA in the Dev Repo.
2. **Push to Mirror**: `git push --force mirror <STABLE_SHA>:main`
3. Cloudflare will automatically redeploy the older version.
