<div align="center">

<img src="https://framerusercontent.com/images/zSvpuPhGXdA7dNvMuVU83gJLUII.png" alt="7el.li logo" width="92" height="92" />

# 7el.li

### Turn any link into a storefront.

Sell files, unlock content, and get paid from a single short link.

[![CI](https://github.com/hacKarim/7el.li/actions/workflows/ci.yml/badge.svg)](https://github.com/hacKarim/7el.li/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

[**▶ Live landing page**](https://jubilant-run-925002.framer.app/)

<br />

<img src="https://framerusercontent.com/images/DyZpmUWCHqjvlygTRaEy7Pi2Vkw.png" alt="Monetize your content: import, lock, share and earn money" width="840" />

</div>

---

**7el.li** is a link-in-bio platform for creators who sell digital products.
Drop your files behind a short link, set a price, and share it anywhere. Buyers
pay in a couple of taps and the download unlocks instantly. You keep a running
balance and cash out to your bank whenever you like.

## Why creators use it

- **One link, everything behind it**: attach any file to a short link and gate it with a price
- **Get paid instantly**: hosted checkout through [Konnect](https://konnect.network), reconciled automatically
- **Your own money, your rules**: in-app wallet with a full transaction ledger and bank withdrawals
- **Know what sells**: per-link views and sales analytics at a glance
- **Looks great on mobile**: installable PWA with a native-feeling mobile layout
- **Automatic receipts**: buyers and sellers both get transactional emails

## How it works

1. **Create a link**: upload a file, name it, set your price.
2. **Share it**: your public creator page lives at `7el.li/p/you`.
3. **Get paid**: buyers check out with Konnect and the file unlocks on payment.
4. **Cash out**: withdraw your wallet balance straight to your bank.

## Built with

Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth, Konnect,
AWS SES, Docker.

## Run it locally

```bash
cp .env.example .env     # add your own keys
npm install
npx prisma migrate dev
npm run dev
```

Then open **http://localhost:3000**.

Ship it with `docker compose up -d --build`.

## Project layout

```
src/
├── app/
│   ├── api/      route handlers: auth, links, payments, wallet, stats
│   ├── p/        public creator profiles
│   └── c/        public collections
├── components/   UI (shadcn/ui + custom animated components)
├── lib/          auth, prisma, konnect, email, image processing
└── emails/       React Email templates
```

> Marketing site and brand visuals designed in [Framer](https://jubilant-run-925002.framer.app/).

## License

[MIT](./LICENSE)
