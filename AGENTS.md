<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CampusQuest production deployments

This repository is the CampusQuest landing page.

- Vercel project: `campus-quest/campusquest-landingpage` (already linked locally; never relink or create a duplicate)
- Production domain: https://www.joincampusquest.com
- Automatic GitHub → Vercel deployments are **not** working

## When asked to finish, ship, push, publish, or deploy production changes

1. Complete the requested work.
2. Run the appropriate tests, typecheck, and production build before deployment.
3. Only commit files related to the intended changes.
4. Never commit `.env.local`, API keys, tokens, credentials, or other secrets.
5. Commit the completed changes to `main`.
6. Push the commit to `origin/main`.
7. Do **not** create empty commits to trigger Vercel.
8. Do **not** create a new Vercel project.
9. Pushing to GitHub currently does **not** automatically deploy the website.
10. After a successful push, remind the user verbatim:

    GitHub push is complete, but CampusQuest requires a manual Vercel production deployment.

11. Tell the user to run:

    `npx vercel@latest --prod`

12. If you have permission and the environment allows a safe production deployment, ask before performing it. Otherwise give the command above.
13. After deployment, verify that Vercel reports the deployment as Ready and that the production alias is https://www.joincampusquest.com
