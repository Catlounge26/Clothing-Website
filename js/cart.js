/* ------------------------------------------------------------------
   SETTINGS — all prices here are PLACEHOLDERS. Change them in one place.
------------------------------------------------------------------ */
const SETTINGS = {
  currency: "$",
  freeShippingMinimum: 100,      // placeholder: amount not decided yet
  packs: {                       // g-string multi-buy prices (placeholders)
    1: 18,
    3: 48,
    5: 75
  }
};

/* ------------------------------------------------------------------
   Simple pretend cart. It only lives in this browser (no real checkout yet).
------------------------------------------------------------------ */
const CART_KEY = "demo-cart";

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
}
function cartTotal(items) { return items.reduce((sum, i) => sum + i.price, 0); }
function cartPairs(items) { return items.reduce((sum, i) => sum + (i.pairs || 1), 0); }
function money(n) { return SETTINGS.currency + n.toFixed(0); }

function refreshCartUI() {
  const items = readCart();
  const total = cartTotal(items);

  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cartPairs(items);
  });

  const min = SETTINGS.freeShippingMinimum;
  const left = Math.max(0, min - total);
  document.querySelectorAll("[data-ship-text]").forEach(el => {
    el.innerHTML = left === 0
      ? "You’ve unlocked <b>free shipping</b>."
      : `You’re <b>${money(left)}</b> away from free shipping.`;
  });
  document.querySelectorAll("[data-ship-bar]").forEach(el => {
    el.style.width = Math.min(100, (total / min) * 100) + "%";
  });
  document.querySelectorAll("[data-free-min]").forEach(el => {
    el.textContent = money(min);
  });
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.querySelector("[data-toast-text]").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 4000);
}

function addToCart(item) {
  const items = readCart();
  items.push(item);
  saveCart(items);
  refreshCartUI();
  showToast(`${item.name} added`);
}

/* ---------- Main page: product form ---------- */
function setupProductForm() {
  const form = document.querySelector("#product-form");
  if (!form) return;

  // Fill in pack prices from SETTINGS
  form.querySelectorAll("[data-pack-price]").forEach(el => {
    const n = Number(el.dataset.packPrice);
    el.textContent = money(SETTINGS.packs[n]);
  });
  form.querySelectorAll("[data-pack-each]").forEach(el => {
    const n = Number(el.dataset.packEach);
    el.textContent = money(SETTINGS.packs[n] / n) + " a pair";
  });

  const priceEl = document.querySelector("[data-from-price]");
  if (priceEl) priceEl.textContent = money(SETTINGS.packs[5] / 5);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const size = form.querySelector("input[name=size]:checked").value;
    const pairs = Number(form.querySelector("input[name=pack]:checked").value);
    addToCart({
      name: `${pairs} × G-String Brief, Black, ${size}`,
      price: SETTINGS.packs[pairs],
      pairs
    });
  });
}

/* ---------- Main page: gallery thumbnails ---------- */
function setupGallery() {
  const main = document.querySelector("#gallery-img");
  document.querySelectorAll(".thumb").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".thumb").forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      if (main && btn.dataset.src) {
        main.src = btn.dataset.src;
        main.alt = btn.dataset.alt || "";
      }
    });
  });
}

/* ---------- Fill-your-cart page: add extra pair ---------- */
function setupAddOns() {
  document.querySelectorAll("[data-add-single]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart({ name: "1 × G-String Brief, Black", price: SETTINGS.packs[1], pairs: 1 });
    });
  });
  document.querySelectorAll("[data-single-price]").forEach(el => {
    el.textContent = money(SETTINGS.packs[1]);
  });
  document.querySelectorAll("[data-notify]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.textContent = "We’ll let you know";
      btn.disabled = true;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupProductForm();
  setupGallery();
  setupAddOns();
  refreshCartUI();
});
