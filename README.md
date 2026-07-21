# InvoiceCraft — Professional Invoice Generator

InvoiceCraft is a **100% frontend, static web application** for creating polished, professional invoices directly in your browser. There is no backend, no database, no account system, and no data ever leaves your device — every invoice you build is saved automatically to your browser's `localStorage` and restored the next time you open the app.

---

## ✨ Core features

- **Split-screen dashboard** — invoice form on the left, real-time live preview on the right.
- **Three visual themes** — Professional, Minimal, and Modern layouts, switchable instantly.
- **Custom accent color** — pick any brand color; it's applied across the invoice preview.
- **Business profile** — name, address, contact details, tax/GST/VAT ID, and a logo upload (via `FileReader`, stored as base64).
- **Optional signature upload** — attach a scanned or drawn signature image, with a one-click remove option.
- **Customer details** — name, address, and contact info for the "Bill To" section.
- **Dynamic line items** — add or remove unlimited rows, with automatic per-row and grand-total calculations.
- **Tax, discount & shipping** — percentage-based tax and discount fields, plus a flat shipping/other-charges field, all reflected live in the totals.
- **Multi-currency support** — ₹ (INR), $ (USD), € (EUR), £ (GBP).
- **Invoice numbering, dates & status** — invoice number, issue date, due date, and a status badge (Draft / Unpaid / Paid / Overdue).
- **PDF export** — one-click, high-quality PDF download powered by `html2pdf.js`.
- **Native browser printing** — a dedicated Print button that uses clean, print-optimized CSS (`@media print`).
- **QR code sharing** — encodes a text summary of the invoice (number, parties, dates, total, status) into a scannable QR code, downloadable as a PNG.
- **Dark mode** — toggle between light and dark themes; preference is remembered.
- **Automatic autosave** — every keystroke is persisted to `localStorage` (debounced), and the whole form is restored on reload.
- **Reset button** — clears all saved data from the browser in one click, with a confirmation prompt.

---

## 🛠 Technologies used

| Purpose            | Library / Tool                                                                 |
|---------------------|----------------------------------------------------------------------------------|
| Styling / layout    | [Tailwind CSS](https://tailwindcss.com/) (via CDN) + custom `style.css`         |
| Fonts               | [Google Fonts](https://fonts.google.com/) — Fraunces, Inter, JetBrains Mono     |
| PDF generation      | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)                        |
| QR code generation  | [qrcodejs](https://github.com/davidshimjs/qrcodejs)                             |
| Persistence         | Browser `localStorage` (no server, no cookies, no tracking)                     |
| Language            | Vanilla HTML, CSS, and JavaScript (no build step, no framework)                 |

Because everything is loaded via CDN `<script>`/`<link>` tags, there is nothing to install or compile — you can open `index.html` directly in a browser, or host the three files anywhere that serves static content.

---

## 📁 Project structure
