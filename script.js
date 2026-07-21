/* =========================================================
   InvoiceCraft — application logic
   Pure client-side. No backend. State persists to localStorage.
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "invoicecraft_state_v1";
  const THEME_KEY = "invoicecraft_dark_mode";

  // ---------------- default state ----------------
  function todayISO(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  function defaultState() {
    return {
      templateTheme: "professional",
      currency: "₹",
      accentColor: "#B7893C",
      invoiceNumber: "INV-0001",
      invoiceStatus: "Draft",
      issueDate: todayISO(0),
      dueDate: todayISO(15),
      bizName: "",
      bizAddress: "",
      bizEmail: "",
      bizPhone: "",
      bizTaxId: "",
      bizLogo: null, // base64 dataURL
      custName: "",
      custAddress: "",
      custEmail: "",
      custPhone: "",
      lineItems: [
        { id: cryptoId(), description: "", qty: 1, rate: 0 }
      ],
      taxRate: 0,
      discountRate: 0,
      shippingFee: 0,
      notes: "",
      terms: "",
      signature: null // base64 dataURL
    };
  }

  function cryptoId() {
    return "li_" + Math.random().toString(36).slice(2, 10);
  }

  // ---------------- state ----------------
  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // merge with defaults to survive schema changes
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      console.warn("InvoiceCraft: could not read saved state, starting fresh.", e);
      return defaultState();
    }
  }

  let saveTimer = null;
  function persistState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        flashSavedIndicator();
      } catch (e) {
        console.warn("InvoiceCraft: could not save state (storage may be full).", e);
      }
    }, 300);
  }

  function flashSavedIndicator() {
    const el = document.getElementById("autosaveIndicator");
    if (!el) return;
    el.classList.remove("hidden");
    el.style.opacity = "1";
    clearTimeout(flashSavedIndicator._t);
    flashSavedIndicator._t = setTimeout(() => { el.style.opacity = "0.4"; }, 900);
  }

  // ---------------- DOM references ----------------
  const $ = (id) => document.getElementById(id);

  const el = {
    templateTheme: $("templateTheme"),
    currency: $("currency"),
    accentColor: $("accentColor"),
    invoiceNumber: $("invoiceNumber"),
    invoiceStatus: $("invoiceStatus"),
    issueDate: $("issueDate"),
    dueDate: $("dueDate"),
    bizName: $("bizName"),
    bizAddress: $("bizAddress"),
    bizEmail: $("bizEmail"),
    bizPhone: $("bizPhone"),
    bizTaxId: $("bizTaxId"),
    logoUpload: $("logoUpload"),
    logoUploadBtn: $("logoUploadBtn"),
    logoRemoveBtn: $("logoRemoveBtn"),
    logoPreview: $("logoPreview"),
    logoPlaceholder: $("logoPlaceholder"),
    custName: $("custName"),
    custAddress: $("custAddress"),
    custEmail: $("custEmail"),
    custPhone: $("custPhone"),
    lineItemsContainer: $("lineItemsContainer"),
    addItemBtn: $("addItemBtn"),
    taxRate: $("taxRate"),
    discountRate: $("discountRate"),
    shippingFee: $("shippingFee"),
    notes: $("notes"),
    terms: $("terms"),
    signatureUpload: $("signatureUpload"),
    signatureUploadBtn: $("signatureUploadBtn"),
    signatureRemoveBtn: $("signatureRemoveBtn"),
    signaturePreview: $("signaturePreview"),
    signaturePlaceholder: $("signaturePlaceholder"),
    downloadPdfBtn: $("downloadPdfBtn"),
    printBtn: $("printBtn"),
    generateQrBtn: $("generateQrBtn"),
    qrWrap: $("qrWrap"),
    qrcode: $("qrcode"),
    downloadQrBtn: $("downloadQrBtn"),
    invoicePreview: $("invoicePreview"),
    themeToggleBtn: $("themeToggleBtn"),
    resetBtn: $("resetBtn"),
    iconMoon: $("iconMoon"),
    iconSun: $("iconSun"),
  };

  // ---------------- form <-> state binding ----------------
  function hydrateForm() {
    el.templateTheme.value = state.templateTheme;
    el.currency.value = state.currency;
    el.accentColor.value = state.accentColor;
    el.invoiceNumber.value = state.invoiceNumber;
    el.invoiceStatus.value = state.invoiceStatus;
    el.issueDate.value = state.issueDate;
    el.dueDate.value = state.dueDate;
    el.bizName.value = state.bizName;
    el.bizAddress.value = state.bizAddress;
    el.bizEmail.value = state.bizEmail;
    el.bizPhone.value = state.bizPhone;
    el.bizTaxId.value = state.bizTaxId;
    el.custName.value = state.custName;
    el.custAddress.value = state.custAddress;
    el.custEmail.value = state.custEmail;
    el.custPhone.value = state.custPhone;
    el.taxRate.value = state.taxRate;
    el.discountRate.value = state.discountRate;
    el.shippingFee.value = state.shippingFee;
    el.notes.value = state.notes;
    el.terms.value = state.terms;

    updateImagePreview(el.logoPreview, el.logoPlaceholder, state.bizLogo);
    updateImagePreview(el.signaturePreview, el.signaturePlaceholder, state.signature);

    renderLineItemRows();
    document.documentElement.style.setProperty("--accent", state.accentColor);
  }

  function updateImagePreview(imgEl, placeholderEl, dataUrl) {
    if (dataUrl) {
      imgEl.src = dataUrl;
      imgEl.classList.remove("hidden");
      placeholderEl.classList.add("hidden");
    } else {
      imgEl.src = "";
      imgEl.classList.add("hidden");
      placeholderEl.classList.remove("hidden");
    }
  }

  function bindSimpleField(inputEl, stateKey, isNumber = false) {
    inputEl.addEventListener("input", () => {
      state[stateKey] = isNumber ? (parseFloat(inputEl.value) || 0) : inputEl.value;
      persistState();
      renderPreview();
    });
  }

  bindSimpleField(el.invoiceNumber, "invoiceNumber");
  bindSimpleField(el.bizName, "bizName");
  bindSimpleField(el.bizAddress, "bizAddress");
  bindSimpleField(el.bizEmail, "bizEmail");
  bindSimpleField(el.bizPhone, "bizPhone");
  bindSimpleField(el.bizTaxId, "bizTaxId");
  bindSimpleField(el.custName, "custName");
  bindSimpleField(el.custAddress, "custAddress");
  bindSimpleField(el.custEmail, "custEmail");
  bindSimpleField(el.custPhone, "custPhone");
  bindSimpleField(el.notes, "notes");
  bindSimpleField(el.terms, "terms");
  bindSimpleField(el.taxRate, "taxRate", true);
  bindSimpleField(el.discountRate, "discountRate", true);
  bindSimpleField(el.shippingFee, "shippingFee", true);
  bindSimpleField(el.issueDate, "issueDate");
  bindSimpleField(el.dueDate, "dueDate");

  el.templateTheme.addEventListener("change", () => {
    state.templateTheme = el.templateTheme.value;
    persistState();
    renderPreview();
  });

  el.currency.addEventListener("change", () => {
    state.currency = el.currency.value;
    persistState();
    renderPreview();
  });

  el.accentColor.addEventListener("input", () => {
    state.accentColor = el.accentColor.value;
    document.documentElement.style.setProperty("--accent", state.accentColor);
    persistState();
  });

  el.invoiceStatus.addEventListener("change", () => {
    state.invoiceStatus = el.invoiceStatus.value;
    persistState();
    renderPreview();
  });

  // ---------------- logo upload ----------------
  el.logoUploadBtn.addEventListener("click", () => el.logoUpload.click());
  el.logoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.bizLogo = reader.result;
      updateImagePreview(el.logoPreview, el.logoPlaceholder, state.bizLogo);
      persistState();
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
  el.logoRemoveBtn.addEventListener("click", () => {
    state.bizLogo = null;
    el.logoUpload.value = "";
    updateImagePreview(el.logoPreview, el.logoPlaceholder, null);
    persistState();
    renderPreview();
  });

  // ---------------- signature upload ----------------
  el.signatureUploadBtn.addEventListener("click", () => el.signatureUpload.click());
  el.signatureUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.signature = reader.result;
      updateImagePreview(el.signaturePreview, el.signaturePlaceholder, state.signature);
      persistState();
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
  el.signatureRemoveBtn.addEventListener("click", () => {
    state.signature = null;
    el.signatureUpload.value = "";
    updateImagePreview(el.signaturePreview, el.signaturePlaceholder, null);
    persistState();
    renderPreview();
  });

  // ---------------- line items ----------------
  function renderLineItemRows() {
    el.lineItemsContainer.innerHTML = "";
    state.lineItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = "line-item-row";
      row.dataset.id = item.id;
      row.innerHTML = `
        <input type="text" class="input li-desc" placeholder="Item description" value="${escapeAttr(item.description)}">
        <input type="number" class="input li-qty" min="0" step="1" value="${item.qty}">
        <input type="number" class="input li-rate" min="0" step="0.01" value="${item.rate}">
        <input type="text" class="input li-amount" value="${formatMoney(item.qty * item.rate)}" readonly>
        <button class="remove-item-btn" title="Remove item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      `;
      el.lineItemsContainer.appendChild(row);

      row.querySelector(".li-desc").addEventListener("input", (e) => {
        item.description = e.target.value;
        persistState();
        renderPreview();
      });
      row.querySelector(".li-qty").addEventListener("input", (e) => {
        item.qty = parseFloat(e.target.value) || 0;
        row.querySelector(".li-amount").value = formatMoney(item.qty * item.rate);
        persistState();
        renderPreview();
      });
      row.querySelector(".li-rate").addEventListener("input", (e) => {
        item.rate = parseFloat(e.target.value) || 0;
        row.querySelector(".li-amount").value = formatMoney(item.qty * item.rate);
        persistState();
        renderPreview();
      });
      row.querySelector(".remove-item-btn").addEventListener("click", () => {
        state.lineItems = state.lineItems.filter((li) => li.id !== item.id);
        if (state.lineItems.length === 0) {
          state.lineItems.push({ id: cryptoId(), description: "", qty: 1, rate: 0 });
        }
        persistState();
        renderLineItemRows();
        renderPreview();
      });
    });
  }

  el.addItemBtn.addEventListener("click", () => {
    state.lineItems.push({ id: cryptoId(), description: "", qty: 1, rate: 0 });
    persistState();
    renderLineItemRows();
    renderPreview();
  });

  // ---------------- calculations ----------------
  function calculateTotals() {
    const subtotal = state.lineItems.reduce((sum, li) => sum + (li.qty * li.rate), 0);
    const discountAmt = subtotal * (state.discountRate / 100);
    const taxableAmt = subtotal - discountAmt;
    const taxAmt = taxableAmt * (state.taxRate / 100);
    const shipping = parseFloat(state.shippingFee) || 0;
    const grandTotal = taxableAmt + taxAmt + shipping;
    return { subtotal, discountAmt, taxAmt, shipping, grandTotal };
  }

  function formatMoney(n) {
    const v = isFinite(n) ? n : 0;
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeAttr(str) {
    return String(str || "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  // ---------------- preview rendering ----------------
  function renderPreview() {
    const t = calculateTotals();
    const cur = state.currency;
    const sheet = el.invoicePreview;
    sheet.className = "invoice-sheet theme-" + state.templateTheme;

    const logoHtml = state.bizLogo
      ? `<img src="${state.bizLogo}" alt="Logo" style="max-height:56px;max-width:180px;object-fit:contain;">`
      : "";

    const itemsRows = state.lineItems.map((li) => `
      <tr>
        <td>${escapeHtml(li.description) || '<span style="opacity:.4">Untitled item</span>'}</td>
        <td style="text-align:center;">${li.qty}</td>
        <td class="amount-cell" style="text-align:right;">${cur}${formatMoney(li.rate)}</td>
        <td class="amount-cell" style="text-align:right;">${cur}${formatMoney(li.qty * li.rate)}</td>
      </tr>
    `).join("");

    const headerBlock = state.templateTheme === "modern" ? `
      <div class="modern-header-block">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            ${logoHtml}
            <h1 class="doc-title" style="margin-top:.5rem;">Invoice</h1>
          </div>
          <div style="text-align:right;">
            <div style="font-size:.78rem;opacity:.85;">Invoice No.</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:1rem;">${escapeHtml(state.invoiceNumber)}</div>
          </div>
        </div>
      </div>
    ` : `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;">
        <div>
          ${logoHtml}
          <h1 class="doc-title" style="margin-top:${state.bizLogo ? '.6rem' : '0'};">Invoice</h1>
          <span class="status-badge status-${state.invoiceStatus}" style="margin-top:.4rem;display:inline-block;">${state.invoiceStatus}</span>
        </div>
        <div style="text-align:right;font-size:.85rem;">
          <div style="opacity:.55;font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;">Invoice No.</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:600;">${escapeHtml(state.invoiceNumber)}</div>
        </div>
      </div>
    `;

    sheet.innerHTML = `
      ${headerBlock}
      <div style="display:flex;justify-content:space-between;gap:2rem;margin-bottom:2rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.3rem;">From</div>
          <div style="font-weight:700;">${escapeHtml(state.bizName) || "Your business name"}</div>
          <div style="font-size:.85rem;opacity:.75;white-space:pre-line;">${escapeHtml(state.bizAddress)}</div>
          <div style="font-size:.85rem;opacity:.75;">${escapeHtml(state.bizEmail)}${state.bizEmail && state.bizPhone ? " · " : ""}${escapeHtml(state.bizPhone)}</div>
          ${state.bizTaxId ? `<div style="font-size:.8rem;opacity:.6;margin-top:.2rem;">Tax ID: ${escapeHtml(state.bizTaxId)}</div>` : ""}
        </div>
        <div style="flex:1;min-width:220px;">
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.3rem;">Bill to</div>
          <div style="font-weight:700;">${escapeHtml(state.custName) || "Customer name"}</div>
          <div style="font-size:.85rem;opacity:.75;white-space:pre-line;">${escapeHtml(state.custAddress)}</div>
          <div style="font-size:.85rem;opacity:.75;">${escapeHtml(state.custEmail)}${state.custEmail && state.custPhone ? " · " : ""}${escapeHtml(state.custPhone)}</div>
        </div>
        <div style="min-width:160px;">
          <div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.3rem;">Dates</div>
          <div style="font-size:.85rem;"><span style="opacity:.6;">Issued:</span> ${formatDateDisplay(state.issueDate)}</div>
          <div style="font-size:.85rem;"><span style="opacity:.6;">Due:</span> ${formatDateDisplay(state.dueDate)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Rate</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;margin-top:1.2rem;">
        <div class="totals-box" style="min-width:280px;padding-top:.8rem;">
          <div style="display:flex;justify-content:space-between;font-size:.85rem;padding:.25rem 0;">
            <span style="opacity:.65;">Subtotal</span><span class="amount-cell">${cur}${formatMoney(t.subtotal)}</span>
          </div>
          ${state.discountRate ? `<div style="display:flex;justify-content:space-between;font-size:.85rem;padding:.25rem 0;">
            <span style="opacity:.65;">Discount (${state.discountRate}%)</span><span class="amount-cell">-${cur}${formatMoney(t.discountAmt)}</span>
          </div>` : ""}
          ${state.taxRate ? `<div style="display:flex;justify-content:space-between;font-size:.85rem;padding:.25rem 0;">
            <span style="opacity:.65;">Tax (${state.taxRate}%)</span><span class="amount-cell">${cur}${formatMoney(t.taxAmt)}</span>
          </div>` : ""}
          ${t.shipping ? `<div style="display:flex;justify-content:space-between;font-size:.85rem;padding:.25rem 0;">
            <span style="opacity:.65;">Shipping / other</span><span class="amount-cell">${cur}${formatMoney(t.shipping)}</span>
          </div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:1.15rem;font-weight:700;padding-top:.6rem;margin-top:.4rem;border-top:1px solid rgba(0,0,0,0.1);">
            <span>Total due</span><span class="amount-cell" style="color:var(--accent);">${cur}${formatMoney(t.grandTotal)}</span>
          </div>
        </div>
      </div>

      ${(state.notes || state.terms) ? `
      <div style="margin-top:2rem;display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
        ${state.notes ? `<div><div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.3rem;">Notes</div><div style="font-size:.82rem;opacity:.75;white-space:pre-line;">${escapeHtml(state.notes)}</div></div>` : "<div></div>"}
        ${state.terms ? `<div><div style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;opacity:.5;margin-bottom:.3rem;">Payment terms</div><div style="font-size:.82rem;opacity:.75;white-space:pre-line;">${escapeHtml(state.terms)}</div></div>` : "<div></div>"}
      </div>` : ""}

      <div style="margin-top:2.5rem;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="font-size:.72rem;opacity:.4;">Generated with InvoiceCraft</div>
        ${state.signature ? `
        <div style="text-align:center;">
          <img src="${state.signature}" alt="Signature" style="max-height:50px;max-width:160px;object-fit:contain;display:block;margin:0 auto;">
          <div style="font-size:.68rem;opacity:.5;border-top:1px solid rgba(0,0,0,0.2);padding-top:.2rem;margin-top:.2rem;">Authorized signature</div>
        </div>` : ""}
      </div>
    `;
  }

  function formatDateDisplay(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

// ---------- PDF export ----------
  el.downloadPdfBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.print();
  });

  // ---------------- print ----------------
  el.printBtn.addEventListener("click", () => window.print());

  // ---------------- QR code ----------------
  el.generateQrBtn.addEventListener("click", () => {
    const t = calculateTotals();
    const summary =
      `InvoiceCraft Invoice\n` +
      `No: ${state.invoiceNumber}\n` +
      `From: ${state.bizName}\n` +
      `To: ${state.custName}\n` +
      `Issued: ${state.issueDate}  Due: ${state.dueDate}\n` +
      `Total: ${state.currency}${formatMoney(t.grandTotal)}\n` +
      `Status: ${state.invoiceStatus}`;

    el.qrcode.innerHTML = "";
    // eslint-disable-next-line no-undef
    new QRCode(el.qrcode, {
      text: summary,
      width: 180,
      height: 180,
      colorDark: "#1B2430",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
    el.qrWrap.classList.remove("hidden");
  });

  el.downloadQrBtn.addEventListener("click", () => {
    const canvas = el.qrcode.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${state.invoiceNumber || "invoice"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // ---------------- dark mode ----------------
  function applyDarkMode(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
    el.iconMoon.classList.toggle("hidden", isDark);
    el.iconSun.classList.toggle("hidden", !isDark);
  }

  el.themeToggleBtn.addEventListener("click", () => {
    const isDark = !document.documentElement.classList.contains("dark");
    applyDarkMode(isDark);
    localStorage.setItem(THEME_KEY, isDark ? "1" : "0");
  });

  // ---------------- reset ----------------
  el.resetBtn.addEventListener("click", () => {
    if (!confirm("This clears all saved invoice data from this browser. Continue?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    hydrateForm();
    renderPreview();
    persistState();
  });

  // ---------------- init ----------------
  function init() {
    const savedDark = localStorage.getItem(THEME_KEY) === "1";
    applyDarkMode(savedDark);
    hydrateForm();
    renderPreview();
  }

  init();

})();
