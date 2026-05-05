const STORAGE_KEY = "qstock-atelier-state-v1";

const roles = [
  { code: "admin", label: "Administrateur" },
  { code: "stock", label: "Gestionnaire de stock" },
  { code: "production", label: "Responsable production" },
  { code: "cashier", label: "Caissier" },
  { code: "accounting", label: "Comptable" },
  { code: "hr", label: "Responsable RH" }
];

const navItems = [
  { id: "dashboard", title: "Tableau de bord", icon: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-4H4v4Z", roles: ["admin", "stock", "production", "cashier", "accounting", "hr"] },
  { id: "pos", title: "Point de vente", icon: "M4 6h16M7 10h10M6 20h12l2-10H4l2 10Z", roles: ["admin", "cashier"] },
  { id: "inventory", title: "Stocks", icon: "M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4", roles: ["admin", "stock", "production"] },
  { id: "production", title: "Fabrication", icon: "M14 7l3 3-7 7H7v-3l7-7Zm2-2 3 3M5 21h14", roles: ["admin", "production", "stock"] },
  { id: "purchases", title: "Achats", icon: "M7 7h14l-2 9H8L7 7ZM7 7 6 3H3M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", roles: ["admin", "stock", "accounting"] },
  { id: "customers", title: "Clients", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", roles: ["admin", "cashier", "accounting"] },
  { id: "finance", title: "Finance OHADA", icon: "M3 6h18M5 6v14h14V6M8 10h8M8 14h8M8 18h3", roles: ["admin", "accounting"] },
  { id: "hr", title: "Ressources humaines", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0", roles: ["admin", "hr", "production"] },
  { id: "admin", title: "Administration", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-2-1.2L15 3h-6l-.5 2.6a8 8 0 0 0-2 1.2l-2.5-1-2 3.4 2.1 1.6A8 8 0 0 0 4 12c0 .4 0 .8.1 1.2L2 14.8l2 3.4 2.5-1a8 8 0 0 0 2 1.2L9 21h6l.5-2.6a8 8 0 0 0 2-1.2l2.5 1 2-3.4-2.1-1.6c.1-.4.1-.8.1-1.2Z", roles: ["admin"] }
];

let state = loadState();
let activeView = "dashboard";
let activeRole = state.session.role;
let cart = [];

const qs = (selector) => document.querySelector(selector);
const money = (value) => `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
const number = (value) => Number(value || 0).toLocaleString("fr-FR");
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const today = () => new Date().toISOString().slice(0, 10);

function createSeedState() {
  return {
    session: {
      role: "admin",
      user: "Aminata N.",
      locationId: "loc-boutique",
      deviceCode: "BTQ-CAISSE-01"
    },
    locations: [
      { id: "loc-boutique", code: "BTQ", name: "Boutique centrale", type: "Magasin" },
      { id: "loc-depot", code: "DEP", name: "Dépôt principal", type: "Entrepôt" },
      { id: "loc-atelier", code: "ATL", name: "Atelier fabrication", type: "Atelier" }
    ],
    products: [
      { id: "prd-ciment", sku: "CIM-50", barcode: "620100001", name: "Ciment 50 kg", category: "Construction", unit: "sac", cost: 4200, price: 5200, min: 20, manufactured: false },
      { id: "prd-clou", sku: "CLO-80", barcode: "620100002", name: "Clous 80 mm", category: "Fixation", unit: "kg", cost: 600, price: 900, min: 50, manufactured: false },
      { id: "prd-peinture", sku: "PEI-BL20", barcode: "620100003", name: "Peinture blanche 20 L", category: "Peinture", unit: "seau", cost: 11500, price: 15500, min: 8, manufactured: false },
      { id: "prd-tube", sku: "TUB-40", barcode: "620100004", name: "Tube acier 40 mm", category: "Métal", unit: "barre", cost: 3500, price: 4900, min: 15, manufactured: false },
      { id: "prd-porte", sku: "POR-MET-90", barcode: "620100005", name: "Porte métallique 90 cm", category: "Fabrication", unit: "pièce", cost: 28000, price: 45000, min: 3, manufactured: true }
    ],
    stockMovements: [
      movement("prd-ciment", "loc-depot", 120, 4200, "opening_balance", "Solde initial"),
      movement("prd-ciment", "loc-boutique", 35, 4200, "opening_balance", "Solde initial"),
      movement("prd-clou", "loc-depot", 220, 600, "opening_balance", "Solde initial"),
      movement("prd-clou", "loc-boutique", 75, 600, "opening_balance", "Solde initial"),
      movement("prd-peinture", "loc-boutique", 16, 11500, "opening_balance", "Solde initial"),
      movement("prd-tube", "loc-atelier", 40, 3500, "opening_balance", "Solde initial"),
      movement("prd-porte", "loc-boutique", 4, 28000, "opening_balance", "Solde initial")
    ],
    customers: [
      { id: "cus-divers", code: "CLT-000", name: "Client comptoir", phone: "", creditLimit: 0 },
      { id: "cus-001", code: "CLT-001", name: "ETS Bâtir Plus", phone: "+237 690 000 001", creditLimit: 250000 },
      { id: "cus-002", code: "CLT-002", name: "Menuiserie Soleil", phone: "+237 690 000 002", creditLimit: 150000 }
    ],
    suppliers: [
      { id: "sup-001", name: "Cimencam Distribution", phone: "+237 699 100 100", terms: 15 },
      { id: "sup-002", name: "Métal Afrique", phone: "+237 699 200 200", terms: 30 }
    ],
    sales: [],
    purchases: [],
    boms: [
      {
        id: "bom-porte",
        code: "BOM-PORTE-90",
        name: "Porte métallique 90 cm",
        productId: "prd-porte",
        outputQty: 1,
        lines: [
          { productId: "prd-tube", qty: 3 },
          { productId: "prd-clou", qty: 2 }
        ]
      }
    ],
    productionOrders: [
      { id: "of-001", no: "OF-2026-001", productId: "prd-porte", qty: 2, produced: 0, status: "planifié", date: today(), laborHours: 0, cost: 0 }
    ],
    employees: [
      { id: "emp-001", name: "Jean Mballa", role: "Soudeur", hourlyRate: 1500, active: true },
      { id: "emp-002", name: "Nora Essomba", role: "Caissière", hourlyRate: 1200, active: true },
      { id: "emp-003", name: "Patrick Ngo", role: "Magasinier", hourlyRate: 1300, active: true }
    ],
    timeEntries: [],
    journal: [],
    audit: [],
    outbox: []
  };
}

function movement(productId, locationId, qty, cost, type, label) {
  return {
    id: uid("mov"),
    productId,
    locationId,
    qty,
    cost,
    type,
    label,
    at: new Date().toISOString()
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createSeedState();
  try {
    return JSON.parse(saved);
  } catch {
    return createSeedState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateSyncStatus();
}

function addAudit(action, entity) {
  state.audit.unshift({
    id: uid("aud"),
    action,
    entity,
    user: roles.find((role) => role.code === activeRole)?.label || activeRole,
    at: new Date().toISOString()
  });
}

function enqueue(type, payload) {
  state.outbox.push({
    id: uid("sync"),
    type,
    payload,
    status: "en attente",
    at: new Date().toISOString()
  });
}

function balance(productId, locationId = "loc-boutique") {
  return state.stockMovements
    .filter((item) => item.productId === productId && item.locationId === locationId)
    .reduce((sum, item) => sum + Number(item.qty), 0);
}

function totalStock(productId) {
  return state.stockMovements
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + Number(item.qty), 0);
}

function productById(id) {
  return state.products.find((product) => product.id === id);
}

function renderIcon(path) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function allowedNav() {
  return navItems.filter((item) => item.roles.includes(activeRole));
}

function boot() {
  renderRoleSelect();
  renderNav();
  bindGlobalEvents();
  navigate(allowedNav().some((item) => item.id === activeView) ? activeView : "dashboard");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

function renderRoleSelect() {
  const select = qs("#roleSelect");
  select.innerHTML = roles.map((role) => `<option value="${role.code}">${role.label}</option>`).join("");
  select.value = activeRole;
}

function renderNav() {
  const nav = qs("#nav");
  nav.innerHTML = allowedNav()
    .map((item) => `
      <button type="button" data-nav="${item.id}" class="${item.id === activeView ? "active" : ""}">
        ${renderIcon(item.icon)}
        <span>${item.title}</span>
      </button>
    `)
    .join("");
}

function bindGlobalEvents() {
  qs("#roleSelect").addEventListener("change", (event) => {
    activeRole = event.target.value;
    state.session.role = activeRole;
    saveState();
    if (!allowedNav().some((item) => item.id === activeView)) activeView = "dashboard";
    renderNav();
    navigate(activeView);
  });

  qs("#nav").addEventListener("click", (event) => {
    const button = event.target.closest("[data-nav]");
    if (button) navigate(button.dataset.nav);
  });

  qs("#syncButton").addEventListener("click", () => {
    state.outbox = state.outbox.map((item) => ({ ...item, status: "synchronisé", syncedAt: new Date().toISOString() }));
    addAudit("Synchronisation manuelle", `${state.outbox.length} opération(s) traitée(s)`);
    state.outbox = [];
    saveState();
    render();
  });

  qs("#seedReset").addEventListener("click", () => {
    if (!confirm("Réinitialiser les données locales de démonstration ?")) return;
    state = createSeedState();
    activeRole = state.session.role;
    cart = [];
    saveState();
    renderRoleSelect();
    renderNav();
    navigate("dashboard");
  });

  window.addEventListener("online", updateSyncStatus);
  window.addEventListener("offline", updateSyncStatus);
}

function updateSyncStatus() {
  const status = qs("#syncStatus");
  const pending = state.outbox.length;
  status.classList.toggle("pending", pending > 0);
  if (!navigator.onLine) {
    status.textContent = pending ? `${pending} opération(s) à synchroniser` : "Mode hors ligne";
    return;
  }
  status.textContent = pending ? `${pending} opération(s) en attente` : "Synchronisé";
}

function navigate(view) {
  activeView = view;
  const item = navItems.find((entry) => entry.id === view);
  qs("#pageTitle").textContent = item?.title || "Application";
  renderNav();
  render();
}

function render() {
  const view = qs("#view");
  const renderers = {
    dashboard: renderDashboard,
    pos: renderPOS,
    inventory: renderInventory,
    production: renderProduction,
    purchases: renderPurchases,
    customers: renderCustomers,
    finance: renderFinance,
    hr: renderHR,
    admin: renderAdmin
  };
  view.innerHTML = renderers[activeView]();
  bindViewEvents();
  updateSyncStatus();
}

function bindViewEvents() {
  if (activeView === "pos") bindPOSEvents();
  if (activeView === "inventory") bindInventoryEvents();
  if (activeView === "production") bindProductionEvents();
  if (activeView === "purchases") bindPurchaseEvents();
  if (activeView === "customers") bindCustomerEvents();
  if (activeView === "finance") bindFinanceEvents();
  if (activeView === "hr") bindHREvents();
}

function renderDashboard() {
  const salesTotal = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const stockValue = state.products.reduce((sum, product) => sum + totalStock(product.id) * product.cost, 0);
  const lowStock = state.products.filter((product) => totalStock(product.id) <= product.min).length;
  const productionOpen = state.productionOrders.filter((order) => !["terminé", "clôturé"].includes(order.status)).length;
  const recentSales = state.sales.slice(0, 5);

  return `
    <section class="grid four">
      ${metric("Chiffre d'affaires", money(salesTotal))}
      ${metric("Valeur du stock", money(stockValue))}
      ${metric("Alertes stock", lowStock)}
      ${metric("Ordres fabrication ouverts", productionOpen)}
    </section>
    <section class="grid two">
      <div class="panel">
        <h2>Alertes et priorités</h2>
        ${renderAlerts()}
      </div>
      <div class="panel">
        <h2>Ventes récentes</h2>
        ${recentSales.length ? table(["Ticket", "Client", "Total", "Date"], recentSales.map((sale) => [
          sale.receipt,
          customerName(sale.customerId),
          money(sale.total),
          new Date(sale.at).toLocaleString("fr-FR")
        ])) : `<div class="empty-state">Aucune vente enregistrée pour le moment.</div>`}
      </div>
    </section>
    <section class="panel">
      <h2>File de synchronisation</h2>
      ${state.outbox.length ? table(["Type", "Statut", "Date"], state.outbox.map((item) => [
        item.type,
        item.status,
        new Date(item.at).toLocaleString("fr-FR")
      ])) : `<div class="empty-state">Aucune opération locale en attente.</div>`}
    </section>
  `;
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderAlerts() {
  const rows = state.products
    .filter((product) => totalStock(product.id) <= product.min)
    .map((product) => `<p><span class="badge warn">Stock bas</span> ${product.name} : ${number(totalStock(product.id))} ${product.unit}</p>`)
    .join("");
  return rows || `<div class="empty-state">Tous les niveaux de stock sont acceptables.</div>`;
}

function renderPOS() {
  const tiles = state.products.map((product) => `
    <button class="product-tile" type="button" data-add-cart="${product.id}">
      <strong>${product.name}</strong>
      <span>${product.sku} · ${money(product.price)}</span><br />
      <span>Stock boutique : ${number(balance(product.id))} ${product.unit}</span>
    </button>
  `).join("");

  return `
    <section class="pos-layout">
      <div class="panel">
        <div class="toolbar">
          <label class="field">
            <span>Scanner ou rechercher</span>
            <input id="scanInput" placeholder="Code-barres, SKU ou nom" autofocus />
          </label>
          <button class="secondary-button" id="clearCart" type="button">Vider panier</button>
        </div>
        <div class="product-grid">${tiles}</div>
      </div>
      <div class="panel">
        <h2>Panier caisse</h2>
        ${renderCart()}
      </div>
    </section>
  `;
}

function renderCart() {
  const subtotal = cart.reduce((sum, item) => sum + item.qty * productById(item.productId).price, 0);
  const tax = subtotal * 0.1925;
  const total = subtotal + tax;
  const customers = state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("");
  const items = cart.length
    ? cart.map((item) => {
        const product = productById(item.productId);
        return `
          <div class="cart-item">
            <div>
              <strong>${product.name}</strong><br />
              <span>${item.qty} × ${money(product.price)}</span>
            </div>
            <div class="qty-controls">
              <button type="button" data-cart-dec="${product.id}">-</button>
              <button type="button" data-cart-inc="${product.id}">+</button>
            </div>
          </div>
        `;
      }).join("")
    : `<div class="empty-state">Scannez un article ou sélectionnez un produit.</div>`;

  return `
    <div class="cart-list">${items}</div>
    <div class="summary-line"><span>Sous-total</span><strong>${money(subtotal)}</strong></div>
    <div class="summary-line"><span>TVA estimée</span><strong>${money(tax)}</strong></div>
    <div class="summary-line total"><span>Total</span><strong>${money(total)}</strong></div>
    <label class="field"><span>Client</span><select id="saleCustomer">${customers}</select></label>
    <label class="field"><span>Paiement</span><select id="paymentMethod"><option value="cash">Espèces</option><option value="mobile_money">Mobile Money</option><option value="card">Carte</option><option value="credit">Crédit client</option></select></label>
    <button class="primary-button" id="completeSale" type="button" ${cart.length ? "" : "disabled"}>Encaisser et imprimer</button>
    <div id="receiptBox"></div>
  `;
}

function bindPOSEvents() {
  qs("#scanInput")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const term = event.target.value.trim().toLowerCase();
    const product = state.products.find((item) => [item.barcode, item.sku.toLowerCase()].includes(term) || item.name.toLowerCase().includes(term));
    if (product) addToCart(product.id);
    event.target.value = "";
  });

  document.querySelectorAll("[data-add-cart]").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.addCart)));
  document.querySelectorAll("[data-cart-inc]").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.cartInc)));
  document.querySelectorAll("[data-cart-dec]").forEach((button) => button.addEventListener("click", () => changeCartQty(button.dataset.cartDec, -1)));
  qs("#clearCart")?.addEventListener("click", () => { cart = []; render(); });
  qs("#completeSale")?.addEventListener("click", completeSale);
}

function addToCart(productId) {
  const line = cart.find((item) => item.productId === productId);
  if (line) line.qty += 1;
  else cart.push({ productId, qty: 1 });
  render();
}

function changeCartQty(productId, delta) {
  const line = cart.find((item) => item.productId === productId);
  if (!line) return;
  line.qty += delta;
  cart = cart.filter((item) => item.qty > 0);
  render();
}

function completeSale() {
  if (!cart.length) return;
  const customerId = qs("#saleCustomer").value;
  const paymentMethod = qs("#paymentMethod").value;
  const subtotal = cart.reduce((sum, item) => sum + item.qty * productById(item.productId).price, 0);
  const tax = subtotal * 0.1925;
  const total = subtotal + tax;
  const receipt = `BTQ-${state.session.deviceCode}-${String(state.sales.length + 1).padStart(5, "0")}`;
  const sale = {
    id: uid("sale"),
    receipt,
    customerId,
    paymentMethod,
    lines: cart.map((item) => ({ ...item, price: productById(item.productId).price })),
    subtotal,
    tax,
    total,
    at: new Date().toISOString()
  };

  state.sales.unshift(sale);
  sale.lines.forEach((line) => {
    const product = productById(line.productId);
    state.stockMovements.push(movement(product.id, "loc-boutique", -line.qty, product.cost, "sale", receipt));
  });
  state.journal.unshift({ id: uid("jrn"), label: `Vente ${receipt}`, debit: total, credit: total, at: sale.at });
  enqueue("vente", sale);
  addAudit("Vente encaissée", receipt);
  saveState();
  const receiptText = buildReceipt(sale);
  cart = [];
  render();
  qs("#receiptBox").innerHTML = `<div class="receipt">${receiptText}</div><button class="secondary-button" type="button" onclick="window.print()">Imprimer ticket</button>`;
}

function buildReceipt(sale) {
  const lines = sale.lines.map((line) => {
    const product = productById(line.productId);
    return `${product.name}\n  ${line.qty} x ${money(line.price)} = ${money(line.qty * line.price)}`;
  }).join("\n");
  return `TALLA QUINCAILLERIE\nTicket: ${sale.receipt}\nDate: ${new Date(sale.at).toLocaleString("fr-FR")}\nClient: ${customerName(sale.customerId)}\n\n${lines}\n\nSous-total: ${money(sale.subtotal)}\nTVA: ${money(sale.tax)}\nTOTAL: ${money(sale.total)}\nPaiement: ${sale.paymentMethod}\nMerci pour votre achat.`;
}

function renderInventory() {
  const rows = state.products.map((product) => {
    const qty = totalStock(product.id);
    return [
      product.sku,
      product.name,
      product.category,
      `${number(qty)} ${product.unit}`,
      money(qty * product.cost),
      qty <= product.min ? `<span class="badge warn">A réapprovisionner</span>` : `<span class="badge good">OK</span>`
    ];
  });

  return `
    <section class="panel">
      <div class="toolbar">
        <h2>Catalogue et niveaux de stock</h2>
        <form id="stockForm" class="form-grid">
          <label class="field"><span>Article</span><select name="productId">${productOptions()}</select></label>
          <label class="field"><span>Lieu</span><select name="locationId">${locationOptions()}</select></label>
          <label class="field"><span>Quantité ajustée</span><input name="qty" type="number" step="0.001" required /></label>
          <button class="primary-button" type="submit">Ajouter mouvement</button>
        </form>
      </div>
      ${table(["SKU", "Article", "Catégorie", "Stock total", "Valorisation", "Statut"], rows)}
    </section>
    <section class="panel">
      <h2>Derniers mouvements</h2>
      ${table(["Date", "Article", "Lieu", "Type", "Quantité", "Référence"], state.stockMovements.slice(-12).reverse().map((mov) => [
        new Date(mov.at).toLocaleString("fr-FR"),
        productById(mov.productId)?.name || mov.productId,
        locationName(mov.locationId),
        mov.type,
        number(mov.qty),
        mov.label
      ]))}
    </section>
  `;
}

function bindInventoryEvents() {
  qs("#stockForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const product = productById(data.productId);
    const mov = movement(product.id, data.locationId, Number(data.qty), product.cost, "adjustment", "Ajustement manuel");
    state.stockMovements.push(mov);
    enqueue("mouvement_stock", mov);
    addAudit("Mouvement de stock", product.name);
    saveState();
    render();
  });
}

function renderProduction() {
  return `
    <section class="grid two">
      <div class="panel">
        <h2>Nouvel ordre de fabrication</h2>
        <form id="productionForm" class="grid">
          <label class="field"><span>Nomenclature</span><select name="bomId">${state.boms.map((bom) => `<option value="${bom.id}">${bom.name}</option>`).join("")}</select></label>
          <label class="field"><span>Quantité à fabriquer</span><input name="qty" type="number" min="1" value="1" required /></label>
          <button class="primary-button" type="submit">Créer ordre</button>
        </form>
      </div>
      <div class="panel">
        <h2>Nomenclatures</h2>
        ${state.boms.map((bom) => `
          <div class="card panel">
            <h3>${bom.name}</h3>
            <p>Produit fini : ${productById(bom.productId).name}</p>
            <p>Composants : ${bom.lines.map((line) => `${line.qty} ${productById(line.productId).unit} ${productById(line.productId).name}`).join(", ")}</p>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      <h2>Ordres de fabrication</h2>
      ${table(["N° OF", "Produit", "Quantité", "Produit", "Statut", "Coût", "Action"], state.productionOrders.map((order) => [
        order.no,
        productById(order.productId).name,
        number(order.qty),
        number(order.produced),
        `<span class="badge ${order.status === "terminé" ? "good" : "warn"}">${order.status}</span>`,
        money(order.cost || 0),
        order.status === "terminé" ? "Terminé" : `<button class="secondary-button" data-complete-of="${order.id}" type="button">Terminer</button>`
      ]))}
    </section>
  `;
}

function bindProductionEvents() {
  qs("#productionForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const bom = state.boms.find((item) => item.id === data.bomId);
    const order = {
      id: uid("of"),
      no: `OF-${new Date().getFullYear()}-${String(state.productionOrders.length + 1).padStart(3, "0")}`,
      productId: bom.productId,
      qty: Number(data.qty),
      produced: 0,
      status: "planifié",
      date: today(),
      laborHours: 0,
      cost: 0
    };
    state.productionOrders.unshift(order);
    enqueue("ordre_fabrication", order);
    addAudit("Ordre de fabrication créé", order.no);
    saveState();
    render();
  });

  document.querySelectorAll("[data-complete-of]").forEach((button) => button.addEventListener("click", () => completeProduction(button.dataset.completeOf)));
}

function completeProduction(orderId) {
  const order = state.productionOrders.find((item) => item.id === orderId);
  const bom = state.boms.find((item) => item.productId === order.productId);
  let materialCost = 0;
  bom.lines.forEach((line) => {
    const component = productById(line.productId);
    const qty = line.qty * order.qty;
    materialCost += qty * component.cost;
    state.stockMovements.push(movement(component.id, "loc-atelier", -qty, component.cost, "production_consume", order.no));
  });
  const finished = productById(order.productId);
  state.stockMovements.push(movement(finished.id, "loc-boutique", order.qty, materialCost / order.qty, "production_output", order.no));
  order.produced = order.qty;
  order.status = "terminé";
  order.cost = materialCost;
  enqueue("fabrication_terminee", order);
  addAudit("Fabrication terminée", order.no);
  saveState();
  render();
}

function renderPurchases() {
  return `
    <section class="panel">
      <h2>Réception fournisseur</h2>
      <form id="purchaseForm" class="form-grid">
        <label class="field"><span>Fournisseur</span><select name="supplierId">${state.suppliers.map((sup) => `<option value="${sup.id}">${sup.name}</option>`).join("")}</select></label>
        <label class="field"><span>Article</span><select name="productId">${productOptions()}</select></label>
        <label class="field"><span>Quantité reçue</span><input name="qty" type="number" min="1" required /></label>
        <label class="field"><span>Coût unitaire</span><input name="cost" type="number" min="0" required /></label>
        <button class="primary-button" type="submit">Enregistrer réception</button>
      </form>
    </section>
    <section class="panel">
      <h2>Achats récents</h2>
      ${state.purchases.length ? table(["N°", "Fournisseur", "Article", "Quantité", "Total", "Date"], state.purchases.map((purchase) => [
        purchase.no,
        supplierName(purchase.supplierId),
        productById(purchase.productId).name,
        number(purchase.qty),
        money(purchase.qty * purchase.cost),
        new Date(purchase.at).toLocaleString("fr-FR")
      ])) : `<div class="empty-state">Aucune réception fournisseur enregistrée.</div>`}
    </section>
  `;
}

function bindPurchaseEvents() {
  qs("#purchaseForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const purchase = {
      id: uid("po"),
      no: `ACH-${String(state.purchases.length + 1).padStart(5, "0")}`,
      supplierId: data.supplierId,
      productId: data.productId,
      qty: Number(data.qty),
      cost: Number(data.cost),
      at: new Date().toISOString()
    };
    state.purchases.unshift(purchase);
    state.stockMovements.push(movement(purchase.productId, "loc-depot", purchase.qty, purchase.cost, "purchase_receipt", purchase.no));
    state.journal.unshift({ id: uid("jrn"), label: `Achat ${purchase.no}`, debit: purchase.qty * purchase.cost, credit: purchase.qty * purchase.cost, at: purchase.at });
    enqueue("achat_reception", purchase);
    addAudit("Réception fournisseur", purchase.no);
    saveState();
    render();
  });
}

function renderCustomers() {
  return `
    <section class="panel">
      <h2>Nouveau client</h2>
      <form id="customerForm" class="form-grid">
        <label class="field"><span>Nom</span><input name="name" required /></label>
        <label class="field"><span>Téléphone</span><input name="phone" /></label>
        <label class="field"><span>Limite de crédit</span><input name="creditLimit" type="number" value="0" /></label>
        <button class="primary-button" type="submit">Créer client</button>
      </form>
    </section>
    <section class="panel">
      <h2>Portefeuille clients</h2>
      ${table(["Code", "Client", "Téléphone", "Limite crédit", "Solde estimé"], state.customers.map((customer) => [
        customer.code,
        customer.name,
        customer.phone || "-",
        money(customer.creditLimit || 0),
        money(customerBalance(customer.id))
      ]))}
    </section>
  `;
}

function bindCustomerEvents() {
  qs("#customerForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const customer = {
      id: uid("cus"),
      code: `CLT-${String(state.customers.length).padStart(3, "0")}`,
      name: data.name,
      phone: data.phone,
      creditLimit: Number(data.creditLimit || 0)
    };
    state.customers.push(customer);
    enqueue("client", customer);
    addAudit("Client créé", customer.name);
    saveState();
    render();
  });
}

function renderFinance() {
  return `
    <section class="grid three">
      ${metric("Ventes comptabilisées", money(state.sales.reduce((sum, sale) => sum + sale.total, 0)))}
      ${metric("Achats comptabilisés", money(state.purchases.reduce((sum, purchase) => sum + purchase.qty * purchase.cost, 0)))}
      ${metric("Écritures journal", state.journal.length)}
    </section>
    <section class="panel">
      <div class="toolbar">
        <h2>Journal simplifié OHADA</h2>
        <button class="secondary-button" id="exportCsv" type="button">Exporter CSV</button>
      </div>
      ${state.journal.length ? table(["Date", "Libellé", "Débit", "Crédit"], state.journal.map((entry) => [
        new Date(entry.at).toLocaleDateString("fr-FR"),
        entry.label,
        money(entry.debit),
        money(entry.credit)
      ])) : `<div class="empty-state">Aucune écriture comptable.</div>`}
    </section>
  `;
}

function bindFinanceEvents() {
  qs("#exportCsv")?.addEventListener("click", () => {
    const rows = [["date", "libelle", "debit", "credit"], ...state.journal.map((entry) => [entry.at, entry.label, entry.debit, entry.credit])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `journal-ohada-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });
}

function renderHR() {
  return `
    <section class="panel">
      <h2>Saisie des heures</h2>
      <form id="timeForm" class="form-grid">
        <label class="field"><span>Employé</span><select name="employeeId">${state.employees.map((emp) => `<option value="${emp.id}">${emp.name}</option>`).join("")}</select></label>
        <label class="field"><span>Ordre fabrication</span><select name="productionOrderId">${state.productionOrders.map((of) => `<option value="${of.id}">${of.no}</option>`).join("")}</select></label>
        <label class="field"><span>Heures</span><input name="hours" type="number" step="0.25" min="0" required /></label>
        <button class="primary-button" type="submit">Enregistrer</button>
      </form>
    </section>
    <section class="grid two">
      <div class="panel">
        <h2>Employés</h2>
        ${table(["Nom", "Poste", "Taux horaire", "Statut"], state.employees.map((emp) => [
          emp.name,
          emp.role,
          money(emp.hourlyRate),
          emp.active ? `<span class="badge good">Actif</span>` : `<span class="badge bad">Inactif</span>`
        ]))}
      </div>
      <div class="panel">
        <h2>Heures production</h2>
        ${state.timeEntries.length ? table(["Date", "Employé", "OF", "Heures", "Coût"], state.timeEntries.map((entry) => {
          const employee = state.employees.find((emp) => emp.id === entry.employeeId);
          const order = state.productionOrders.find((of) => of.id === entry.productionOrderId);
          return [new Date(entry.at).toLocaleDateString("fr-FR"), employee.name, order.no, number(entry.hours), money(entry.hours * employee.hourlyRate)];
        })) : `<div class="empty-state">Aucune heure saisie.</div>`}
      </div>
    </section>
  `;
}

function bindHREvents() {
  qs("#timeForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const entry = {
      id: uid("time"),
      employeeId: data.employeeId,
      productionOrderId: data.productionOrderId,
      hours: Number(data.hours),
      at: new Date().toISOString()
    };
    const employee = state.employees.find((emp) => emp.id === entry.employeeId);
    const order = state.productionOrders.find((of) => of.id === entry.productionOrderId);
    order.laborHours = Number(order.laborHours || 0) + entry.hours;
    order.cost = Number(order.cost || 0) + entry.hours * employee.hourlyRate;
    state.timeEntries.unshift(entry);
    enqueue("heures_rh", entry);
    addAudit("Heures saisies", `${employee.name} - ${order.no}`);
    saveState();
    render();
  });
}

function renderAdmin() {
  return `
    <section class="grid three">
      ${metric("Utilisateurs types", roles.length)}
      ${metric("Sites", state.locations.length)}
      ${metric("Terminaux", 1)}
    </section>
    <section class="grid two">
      <div class="panel">
        <h2>Rôles et accès</h2>
        ${table(["Rôle", "Modules autorisés"], roles.map((role) => [
          role.label,
          navItems.filter((item) => item.roles.includes(role.code)).map((item) => item.title).join(", ")
        ]))}
      </div>
      <div class="panel">
        <h2>Sites et appareils</h2>
        ${table(["Code", "Nom", "Type"], state.locations.map((loc) => [loc.code, loc.name, loc.type]))}
      </div>
    </section>
    <section class="panel">
      <h2>Journal d'audit</h2>
      ${state.audit.length ? table(["Date", "Utilisateur", "Action", "Objet"], state.audit.slice(0, 25).map((log) => [
        new Date(log.at).toLocaleString("fr-FR"),
        log.user,
        log.action,
        log.entity
      ])) : `<div class="empty-state">Aucune action auditée.</div>`}
    </section>
  `;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function productOptions() {
  return state.products.map((product) => `<option value="${product.id}">${product.name}</option>`).join("");
}

function locationOptions() {
  return state.locations.map((location) => `<option value="${location.id}">${location.name}</option>`).join("");
}

function customerName(id) {
  return state.customers.find((customer) => customer.id === id)?.name || "Client comptoir";
}

function supplierName(id) {
  return state.suppliers.find((supplier) => supplier.id === id)?.name || "Fournisseur";
}

function locationName(id) {
  return state.locations.find((location) => location.id === id)?.name || id;
}

function customerBalance(customerId) {
  return state.sales
    .filter((sale) => sale.customerId === customerId && sale.paymentMethod === "credit")
    .reduce((sum, sale) => sum + sale.total, 0);
}

boot();
