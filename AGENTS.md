# AGENTS.md

## Cursor Cloud specific instructions

**Product focus:** Prefer **ShopFlow** unless the user asks about TradePro. ShopFlow is a **2-person mobile mechanic** job board for **Antonio & Anthony** (not a multi-tech shop floor). Tabs: Jobs / Truck / Done. No Crew tab.

**Live hosting:** GitHub Pages from `main` → `https://2xywzwvwvq-a11y.github.io/Shopflow-/shopflow.html` (root `/` redirects via `index.html`). Phone home-screen icons keep working after updates as long as this URL stays the same.

This repo is two independent **client-only** HTML apps (no package manager, backend, database, lint, tests, or build step):

| App | Path | URL when serving repo root |
|-----|------|----------------------------|
| ShopFlow | `shopflow.html` (+ `index.html` redirect) | `http://127.0.0.1:8080/shopflow.html` |
| TradePro | `TradePro` (no `.html` extension) | Prefer `http://127.0.0.1:8080/TradePro.html` after linking (see below) |

### Run locally

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Data persists in browser `localStorage` (`shopflow_data`, `tp_s`).

### TradePro MIME gotcha

`TradePro` has no `.html` extension. `python3 -m http.server` may serve it as `application/octet-stream`, so Chrome downloads the file instead of rendering it. Session workaround (do not commit unless product owners want a rename):

```bash
ln -sfn TradePro TradePro.html
```

Then open `/TradePro.html`. Alternatively use a static server that sets HTML content-type by sniffing, or rename the file to `TradePro.html` in a product PR.

### Lint / test / build

None exist in this repository. Manual browser checks are the verification path.

### Hello-world checks

- **ShopFlow:** create a job with address/when/who (Antonio or Anthony)/status; cycle status; Complete → Done; Restore without duplicating; Truck checklist Reset.
- **TradePro:** BUY market order (click a quote row to set symbol, set qty, Place Buy Order); confirm position + funds change.
