# Contributing

## Running it locally

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

You need a Postgres instance. `docker-compose.yml` brings one up if you do not
have one. Payments need Konnect credentials, and email needs SES; without them
the app runs but those two flows fail at the last step, which is usually fine
for working on anything else.

Never commit a real `.env`. The repository history was rewritten once already
to get one out of it.

## Before you open a pull request

CI runs `npx prettier@3.3.3 --check .`. Run prettier before pushing or it will
fail on whitespace.

`npm run lint` is worth running too, though CI does not gate on it yet.

## Database changes

A schema change is a migration, never an edit to an existing one in
`prisma/migrations`. Say in the pull request what happens to rows that already
exist, because this is a live app and the answer is not always "nothing".

## Money

Anything that touches pricing, payouts or the payment callback gets a second
look and a slower merge. If you are changing how an amount is calculated, put
the arithmetic in the pull request description in plain numbers, with an
example order.
