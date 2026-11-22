# RepairRelay

Open-source project in development. This repository currently contains the verified development foundation, not a completed product.

## Local development

Use Node 24.21.0.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e:local # Chromium and WebKit on this Mac; CI runs all three browsers
```

Read [implementation plan](docs/IMPLEMENTATION.md), [engineering standards](docs/ENGINEERING.md) and [current status](docs/STATUS.md).

## Contributions

See [CONTRIBUTING.md](CONTRIBUTING.md). Report defects with synthetic data only.
