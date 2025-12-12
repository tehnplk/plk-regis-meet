# Local run steps (Windows)

## Step 1: Kill ports 3000-3005

Run:

```bash
npx kill-port 3000 3001 3002 3003 3004 3005
```

## Step 2: Start dev server

Run:

```bash
npm run dev
```

## Expected URL

- http://localhost:3000

## Why this step order

- Prevents port-in-use issues.
- Prevents Next.js dev lock conflict at `.next/dev/lock` when another instance is still running.
