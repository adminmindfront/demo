import { PAVILIONS, PRODUCTS } from "./data.js";
import { renderIcon } from "./icons.js";
import { auth, database, googleProvider } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  get,
  ref,
  serverTimestamp,
  set,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const app = document.querySelector("#app");
const EXPERIENCE_VERSION = "20260328a";
const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const DEFAULT_USER_DATA = {
  unlockedStamps: [],
  cart: [],
  purchases: [],
};

const timers = {
  arScanner: null,
  payment: null,
};

const state = {
  activeTab: "passport",
  unlockedStamps: [],
  cart: [],
  purchases: [],
  showCheckout: false,
  showQRModal: null,
  showARScanner: null,
  showARExperience: null,
  showModelViewer: null,
  showStampCelebration: null,
  arScanned: false,
  isProcessingPayment: false,
  user: null,
  authStatus: "loading",
  authMode: "login",
  authMessage: "",
  authError: "",
  isAuthSubmitting: false,
  ai: {
    lang: "es",
    input: "",
    messages: [
      {
        id: 1,
        text: "Hola explorador. Soy Fidencio, la IA del Museo del Desierto. Puedes preguntarme sobre dinosaurios, horarios o tu visita.",
        sender: "bot",
      },
    ],
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

function getPavilionById(id) {
  return PAVILIONS.find((item) => item.id === Number(id));
}

function getProductById(id) {
  return PRODUCTS.find((item) => item.id === id);
}

function getPurchaseById(id) {
  return state.purchases.find((item) => item.id === id);
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price, 0);
}

function buildPhotoBoothUrl() {
  const params = new URLSearchParams();

  if (state.user?.email) {
    params.set("email", state.user.email);
  }

  if (state.user?.displayName) {
    params.set("name", state.user.displayName);
  }

  params.set("v", EXPERIENCE_VERSION);

  return `./photo-booth.html?${params.toString()}`;
}

function renderBrandMark() {
  return `
    <div class="brand__mark">
      <img src="./assets/ar/images/mude.png" alt="Logo MUDE" />
    </div>
  `;
}

function resetInteractiveState() {
  clearTimeout(timers.arScanner);
  clearTimeout(timers.payment);
  state.activeTab = "passport";
  state.unlockedStamps = [];
  state.cart = [];
  state.purchases = [];
  state.showCheckout = false;
  state.showQRModal = null;
  state.showARScanner = null;
  state.showARExperience = null;
  state.showModelViewer = null;
  state.showStampCelebration = null;
  state.arScanned = false;
  state.isProcessingPayment = false;
}

function sanitizeUnlockedStamps(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedIds = new Set(PAVILIONS.map((item) => item.id));
  return [...new Set(value.map((item) => Number(item)).filter((item) => allowedIds.has(item)))];
}

function sanitizeCart(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => getProductById(item?.id)).filter(Boolean);
}

function sanitizePurchaseItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const catalogProduct = getProductById(item?.id);

      if (catalogProduct) {
        return catalogProduct;
      }

      const fallbackPrice = Number(item?.price);
      return {
        id: String(item?.id ?? `custom-${Date.now()}`),
        name: String(item?.name ?? "Articulo"),
        price: Number.isFinite(fallbackPrice) ? fallbackPrice : 0,
        type: typeof item?.type === "string" ? item.type : "misc",
      };
    })
    .filter((item) => item.name);
}

function sanitizePurchases(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((purchase) => {
      const items = sanitizePurchaseItems(purchase?.items);
      const rawTotal = Number(purchase?.total);
      return {
        id: String(purchase?.id ?? `TXN-${Date.now()}`),
        items,
        total: Number.isFinite(rawTotal)
          ? rawTotal
          : items.reduce((sum, item) => sum + item.price, 0),
        date: String(purchase?.date ?? ""),
      };
    })
    .filter((purchase) => purchase.id);
}

function sanitizeUserData(value) {
  const input = value && typeof value === "object" ? value : {};

  return {
    unlockedStamps: sanitizeUnlockedStamps(input.unlockedStamps),
    cart: sanitizeCart(input.cart),
    purchases: sanitizePurchases(input.purchases),
  };
}

function applyUserData(userData) {
  const safeData = sanitizeUserData(userData);
  state.unlockedStamps = safeData.unlockedStamps;
  state.cart = safeData.cart;
  state.purchases = safeData.purchases;
}

async function persistUserData() {
  if (!state.user?.uid) {
    return;
  }

  const payload = {
    unlockedStamps: state.unlockedStamps,
    cart: state.cart,
    purchases: state.purchases,
  };

  try {
    await set(ref(database, `users/${state.user.uid}/appData`), payload);
  } catch (error) {
    console.error("No se pudo guardar el estado del usuario en Firebase.", error);
  }
}

async function hydrateUserState(firebaseUser) {
  state.authStatus = "loading";
  state.authError = "";
  state.authMessage = "";
  renderApp();

  try {
    const userRef = ref(database, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};
    const safeAppData = sanitizeUserData(existingData.appData ?? DEFAULT_USER_DATA);

    state.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || existingData.profile?.email || "",
      displayName: firebaseUser.displayName || existingData.profile?.displayName || "",
      photoURL: firebaseUser.photoURL || existingData.profile?.photoURL || "",
    };

    applyUserData(safeAppData);

    await set(userRef, {
      profile: {
        uid: firebaseUser.uid,
        email: state.user.email,
        displayName: state.user.displayName,
        photoURL: state.user.photoURL,
        providerIds: firebaseUser.providerData
          .map((item) => item.providerId)
          .filter(Boolean),
        createdAt: existingData.profile?.createdAt ?? serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      appData: safeAppData,
    });

    state.authStatus = "authenticated";
    renderApp();
  } catch (error) {
    console.error("No se pudo cargar la sesion del usuario.", error);
    state.user = null;
    resetInteractiveState();
    state.authStatus = "unauthenticated";
    state.authError =
      "No se pudo cargar tu informacion desde Firebase. Revisa las reglas de base de datos y vuelve a intentar.";
    renderApp();
  }
}

function getAuthErrorMessage(error) {
  const messages = {
    "auth/invalid-email": "Ingresa un correo valido.",
    "auth/missing-password": "Ingresa tu contrasena.",
    "auth/weak-password": "La contrasena debe tener al menos 6 caracteres.",
    "auth/email-already-in-use": "Ese correo ya esta registrado.",
    "auth/invalid-credential": "Correo o contrasena incorrectos.",
    "auth/wrong-password": "Correo o contrasena incorrectos.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/popup-closed-by-user":
      "Se cerro la ventana de Google antes de completar el acceso.",
    "auth/popup-blocked":
      "El navegador bloqueo la ventana emergente de Google. Permite popups e intenta otra vez.",
    "auth/operation-not-allowed":
      "Debes habilitar este metodo en Firebase Authentication.",
    "auth/account-exists-with-different-credential":
      "Ese correo ya existe con otro metodo de acceso.",
    "auth/network-request-failed":
      "No se pudo conectar con Firebase. Revisa tu conexion.",
  };

  return messages[error?.code] || "No fue posible completar la autenticacion.";
}

function renderApp() {
  if (state.authStatus === "loading") {
    app.innerHTML = renderAuthLoading();
    return;
  }

  if (!state.user) {
    app.innerHTML = renderAuthScreen();
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${state.activeTab !== "ai" ? renderHeader() : ""}
      <main class="app-content">
        ${renderCurrentView()}
      </main>
      ${renderBottomNav()}
      ${renderARScannerModal()}
      ${renderARExperienceModal()}
      ${renderModelViewerModal()}
      ${renderStampCelebrationModal()}
      ${renderCheckoutModal()}
      ${renderQRCodeModal()}
    </div>
  `;

  if (state.activeTab === "ai") {
    requestAnimationFrame(() => {
      const messagesEnd = document.querySelector("[data-chat-end]");
      messagesEnd?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }
}

function renderAuthLoading() {
  return `
    <section class="auth-shell">
      <div class="auth-shell__backdrop"></div>
      <div class="auth-panel auth-panel--loading">
        <div class="auth-brand">
          ${renderBrandMark()}
          <div>
            <p class="brand__title">MUDE Explorer</p>
            <p class="brand__subtitle">Museo del Desierto</p>
          </div>
        </div>
        <div class="auth-loading">
          <span class="auth-loading__dot"></span>
          <p>Comprobando tu sesion...</p>
        </div>
      </div>
    </section>
  `;
}

function renderAuthScreen() {
  const isSignup = state.authMode === "signup";

  return `
    <section class="auth-shell auth-shell--scrollable">
      <div class="auth-shell__backdrop"></div>
      <div class="auth-panel">
        <div class="auth-brand">
          ${renderBrandMark()}
          <div>
            <p class="brand__title">MUDE Explorer</p>
            <p class="brand__subtitle">Acceso obligatorio para visitar la app</p>
          </div>
        </div>

        <div class="auth-copy">
          <p class="eyebrow">Bienvenido</p>
          <h1>Inicia sesion para guardar tu experiencia en Firebase</h1>
          <p>
            Tu correo, sellos, carrito y compras quedaran vinculados a tu cuenta.
          </p>
        </div>

        <button class="google-button" data-action="google-login" ${state.isAuthSubmitting ? "disabled" : ""}>
          <span class="google-button__icon">
            <img src="./assets/img/google.webp" alt="Google" />
          </span>
          Iniciar sesion con Google
        </button>

        <div class="auth-divider auth-divider--tight">
          <span></span>
          <p>o usa otra opcion</p>
          <span></span>
        </div>

        <div class="auth-switch">
          <button class="auth-switch__item ${!isSignup ? "is-active" : ""}" data-action="set-auth-mode" data-mode="login">
            Iniciar sesion
          </button>
          <button class="auth-switch__item ${isSignup ? "is-active" : ""}" data-action="set-auth-mode" data-mode="signup">
            Crear cuenta
          </button>
        </div>

        <form class="auth-form" data-form="auth">
          <label>
            <span>Correo electronico</span>
            <input type="email" name="email" placeholder="explorador@mude.com" required />
          </label>
          <label>
            <span>Contrasena</span>
            <input type="password" name="password" placeholder="Minimo 6 caracteres" required />
          </label>
          ${
            isSignup
              ? `
                <label>
                  <span>Confirmar contrasena</span>
                  <input type="password" name="confirmPassword" placeholder="Repite tu contrasena" required />
                </label>
              `
              : ""
          }

          ${
            state.authError
              ? `<p class="auth-feedback auth-feedback--error">${escapeHtml(state.authError)}</p>`
              : ""
          }
          ${
            state.authMessage
              ? `<p class="auth-feedback auth-feedback--success">${escapeHtml(state.authMessage)}</p>`
              : ""
          }

          <button class="primary-button primary-button--wide" type="submit" ${state.isAuthSubmitting ? "disabled" : ""}>
            ${
              state.isAuthSubmitting
                ? "Procesando..."
                : isSignup
                  ? "Crear usuario"
                  : "Entrar con correo"
            }
          </button>
        </form>
      </div>
    </section>
  `;
}

function renderHeader() {
  return `
    <header class="topbar">
      <div class="brand">
        ${renderBrandMark()}
        <div>
          <p class="brand__title">MUDE Explorer</p>
          <p class="brand__subtitle">Museo del Desierto</p>
        </div>
      </div>
      <div class="topbar__actions">
        ${
          state.cart.length > 0
            ? `
              <div class="status-pill">
                <span class="status-pill__dot"></span>
                ${state.cart.length} en carrito
              </div>
            `
            : ""
        }
        <button class="ghost-button logout-button" data-action="logout">
          ${renderIcon("log-out", { size: 16 })}
          Salir
        </button>
      </div>
    </header>
  `;
}

function renderCurrentView() {
  switch (state.activeTab) {
    case "pavilions":
      return renderPavilionsView();
    case "photo":
      return renderPhotoView();
    case "shop":
      return renderShopView();
    case "ai":
      return renderAIGuideView();
    case "passport":
    default:
      return renderPassportView();
  }
}

function renderPassportView() {
  const purchasesSection =
    state.purchases.length > 0
      ? `
        <section class="section-block">
          <h3 class="section-title">
            ${renderIcon("qr-code", { className: "section-title__icon", size: 18 })}
            Mis entradas y pases
          </h3>
          <div class="stack-list">
            ${state.purchases
              .map(
                (purchase) => `
                  <button class="receipt-card" data-action="open-qr" data-purchase-id="${purchase.id}">
                    <div>
                      <p class="receipt-card__title">Recibo ${escapeHtml(purchase.id)}</p>
                      <p class="receipt-card__meta">${purchase.items.length} articulo(s) · ${formatCurrency(purchase.total)}</p>
                    </div>
                    <span class="receipt-card__icon">
                      ${renderIcon("qr-code", { size: 22 })}
                    </span>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      `
      : "";

  return `
    <section class="view view--passport">
      <article class="passport-card">
        <div class="passport-card__bone">
          ${renderIcon("bone", { size: 120 })}
        </div>
        <div class="passport-card__profile">
          <div class="passport-card__avatar">
            ${
              state.user?.photoURL
                ? `<img src="${escapeHtml(state.user.photoURL)}" alt="Foto de perfil" />`
                : renderIcon("user", { size: 36 })
            }
          </div>
          <div>
            <h2 class="passport-card__title">Explorador MUDE</h2>
            <p class="passport-card__id">Usuario: ${escapeHtml(state.user?.email || "Sin correo")}</p>
            <div class="badge-inline">
              ${renderIcon("award", { size: 16 })}
              Rango: Paleontologo Novato
            </div>
          </div>
        </div>
      </article>

      <section class="section-block">
        <h3 class="section-title">
          ${renderIcon("scan-line", { className: "section-title__icon", size: 18 })}
          Sellos de expedicion (${state.unlockedStamps.length}/4)
        </h3>

        <div class="stamp-grid">
          ${PAVILIONS.map((pavilion) => {
            const unlocked = state.unlockedStamps.includes(pavilion.id);
            const isInteractive = unlocked && pavilion.id === 1;
            return `
              <article
                class="stamp-card ${unlocked ? "is-unlocked" : ""} ${isInteractive ? "is-interactive" : ""}"
                ${isInteractive ? `data-action="open-stamp-ar" data-pavilion-id="${pavilion.id}"` : ""}
              >
                <div class="stamp-card__icon stamp-card__icon--${pavilion.color}">
                  ${pavilion.icon}
                </div>
                <p class="stamp-card__name">${escapeHtml(pavilion.name)}</p>
                ${
                  unlocked
                    ? `<p class="stamp-card__status">${isInteractive ? "Ver en AR" : "Desbloqueado"}</p>`
                    : '<p class="stamp-card__status stamp-card__status--muted">Pendiente</p>'
                }
              </article>
            `;
          }).join("")}
        </div>

        ${
          state.unlockedStamps.length === PAVILIONS.length
            ? `
              <div class="success-banner">
                <h4>Expedicion completada</h4>
                <p>Desbloqueaste tu cupon del 10% en tienda.</p>
              </div>
            `
            : ""
        }
      </section>

      ${purchasesSection}
    </section>
  `;
}

function renderPhotoView() {
  return `
    <section class="view view--photo">
      <div class="experience-card experience-card--photo">
        <iframe
          class="experience-frame experience-frame--photo"
          src="${buildPhotoBoothUrl()}"
          title="Cabina de foto MUDE"
          allow="camera; microphone"
        ></iframe>
      </div>
    </section>
  `;
}

function renderPavilionsView() {
  return `
    <section class="view view--pavilions">
      <div class="view-headline">
        <p class="eyebrow">Ruta interactiva</p>
        <h2>Explorar pabellones</h2>
        <p>
          Encuentra los marcadores AR en cada zona para coleccionar sellos
          fisicos y digitales.
        </p>
      </div>

      <div class="stack-list">
        ${PAVILIONS.map(
          (pavilion) => `
            <article class="pavilion-card">
              <div class="pavilion-card__bar pavilion-card__bar--${pavilion.color}"></div>
              <div class="pavilion-card__content">
                <div class="pavilion-card__summary">
                  <div class="pavilion-card__emoji">${pavilion.icon}</div>
                  <div>
                    <h3>${escapeHtml(pavilion.name)}</h3>
                    <p>${escapeHtml(pavilion.desc)}</p>
                  </div>
                </div>
                <button class="primary-button primary-button--compact" data-action="open-ar" data-pavilion-id="${pavilion.id}">
                  ${renderIcon("camera", { size: 16 })}
                  Escanear AR
                </button>
              </div>
            </article>
          `
        ).join("")}
      </div>
    </section>
  `;
}

function renderShopView() {
  const tickets = PRODUCTS.filter((product) => product.type === "ticket");
  const extras = PRODUCTS.filter((product) => product.type !== "ticket");
  const cartTotal = getCartTotal();

  return `
    <section class="view view--shop">
      <div class="view-headline">
        <p class="eyebrow">Compra digital</p>
        <h2>Taquilla y servicios</h2>
      </div>

      ${renderProductGroup("Boletos de entrada", tickets)}
      ${renderProductGroup("Experiencias y alimentos", extras)}

      ${
        state.cart.length > 0
          ? `
            <aside class="floating-cart">
              <div>
                <p class="floating-cart__meta">${state.cart.length} articulo(s)</p>
                <p class="floating-cart__total">Total: ${formatCurrency(cartTotal)}</p>
              </div>
              <button class="success-button" data-action="open-checkout">
                Pagar
                ${renderIcon("chevron-right", { size: 18 })}
              </button>
            </aside>
          `
          : ""
      }
    </section>
  `;
}

function renderProductGroup(title, products) {
  return `
    <section class="section-block section-block--spaced">
      <h3 class="section-subtitle">${escapeHtml(title)}</h3>
      <div class="stack-list">
        ${products
          .map(
            (product) => `
              <article class="product-card">
                <div>
                  <h4>${escapeHtml(product.name)}</h4>
                  <p>${formatCurrency(product.price)}</p>
                </div>
                <button class="icon-button icon-button--warm" data-action="add-to-cart" data-product-id="${product.id}" aria-label="Agregar ${escapeHtml(product.name)}">
                  ${renderIcon("shopping-cart", { size: 18 })}
                </button>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderAIGuideView() {
  return `
    <section class="chat-view">
      <header class="chat-header">
        <div class="chat-header__identity">
          <div class="chat-header__avatar">🦬</div>
          <div>
            <h2>Fidencio IA</h2>
            <p>En linea</p>
          </div>
        </div>
        <div class="chat-header__actions">
          <button class="ghost-button ghost-button--dark" data-action="toggle-lang">
            ${renderIcon("globe", { size: 14 })}
            ${state.ai.lang === "es" ? "ES" : "EN"}
          </button>
          <button class="ghost-button ghost-button--dark" data-action="logout">
            ${renderIcon("log-out", { size: 14 })}
            Salir
          </button>
        </div>
      </header>

      <div class="chat-messages">
        ${state.ai.messages
          .map(
            (message) => `
              <div class="chat-row ${message.sender === "user" ? "chat-row--user" : ""}">
                <article class="chat-bubble ${message.sender === "user" ? "chat-bubble--user" : ""}">
                  <p>${escapeHtml(message.text)}</p>
                </article>
              </div>
            `
          )
          .join("")}
        <div data-chat-end></div>
      </div>

      <form class="chat-inputbar" data-form="chat">
        <input
          type="text"
          name="chatMessage"
          data-role="chat-input"
          value="${escapeHtml(state.ai.input)}"
          placeholder="${state.ai.lang === "es" ? "Pregunta algo..." : "Ask something..."}"
          autocomplete="off"
        />
        <button class="icon-button icon-button--solid" type="submit" aria-label="Enviar mensaje">
          ${renderIcon("send", { size: 18 })}
        </button>
      </form>
    </section>
  `;
}

function renderBottomNav() {
  const tabs = [
    { id: "passport", label: "Pasaporte", icon: "user" },
    { id: "pavilions", label: "Explorar", icon: "map" },
    { id: "photo", label: "Foto", icon: "camera" },
    { id: "shop", label: "Tienda", icon: "ticket" },
    { id: "ai", label: "Guia IA", icon: "message-circle" },
  ];

  return `
    <nav class="bottom-nav">
      ${tabs
        .map((tab) => {
          const active = state.activeTab === tab.id;
          return `
            <button class="bottom-nav__item ${active ? "is-active" : ""}" data-action="set-tab" data-tab="${tab.id}">
              <span class="bottom-nav__icon-wrap">
                ${renderIcon(tab.icon, { size: 22 })}
                ${
                  tab.id === "shop" && state.cart.length > 0
                    ? `<span class="bottom-nav__badge">${state.cart.length}</span>`
                    : ""
                }
              </span>
              <span>${tab.label}</span>
            </button>
          `;
        })
        .join("")}
    </nav>
  `;
}

function renderARScannerModal() {
  if (!state.showARScanner) {
    return "";
  }

  return `
    <div class="modal-overlay modal-overlay--scanner" data-backdrop="ar">
      <section class="scanner-modal animate-fade-in">
        <button class="icon-button icon-button--overlay scanner-modal__close" data-action="close-ar" aria-label="Cerrar escaner">
          ${renderIcon("x", { size: 20 })}
        </button>

        ${
          !state.arScanned
            ? `
              <div class="scanner-stage">
                <div class="scanner-frame">
                  <span class="scanner-line"></span>
                  ${renderIcon("scan-line", { size: 52, className: "scanner-stage__icon" })}
                </div>
                <h3>Apuntando al marcador del pasaporte...</h3>
                <p>
                  Alinea la camara con el simbolo impreso de
                  "${escapeHtml(state.showARScanner.name)}".
                </p>
              </div>
            `
            : `
              <div class="scanner-success">
                <div class="scanner-success__emoji">${state.showARScanner.icon}</div>
                <div class="scanner-success__panel">
                  <div class="scanner-success__check">
                    ${renderIcon("check-circle", { size: 28 })}
                  </div>
                  <h3>Sello desbloqueado</h3>
                  <p>Capturaste la experiencia de ${escapeHtml(state.showARScanner.name)}.</p>
                  <button class="primary-button" data-action="view-passport-after-scan">Ver mi pasaporte</button>
                </div>
              </div>
            `
        }
      </section>
    </div>
  `;
}

function renderARExperienceModal() {
  if (!state.showARExperience) {
    return "";
  }

  return `
    <div class="modal-overlay modal-overlay--experience" data-backdrop="ar-experience">
      <section class="experience-modal animate-fade-in">
        <button
          class="icon-button icon-button--overlay scanner-modal__close"
          data-action="close-ar-experience"
          aria-label="Cerrar experiencia AR"
        >
          ${renderIcon("x", { size: 20 })}
        </button>

        <iframe
          class="experience-frame"
          src="./ar-scanner.html?v=${EXPERIENCE_VERSION}"
          title="Escaner AR MUDE"
          allow="autoplay; camera; xr-spatial-tracking; fullscreen"
        ></iframe>
      </section>
    </div>
  `;
}

function renderModelViewerModal() {
  if (!state.showModelViewer) {
    return "";
  }

  return `
    <div class="modal-overlay modal-overlay--experience" data-backdrop="model-viewer">
      <section class="experience-modal animate-fade-in">
        <button
          class="icon-button icon-button--overlay scanner-modal__close"
          data-action="close-model-viewer"
          aria-label="Cerrar visor AR"
        >
          ${renderIcon("x", { size: 20 })}
        </button>

        <iframe
          class="experience-frame"
          src="./ar-viewer.html?v=${EXPERIENCE_VERSION}"
          title="Visor 3D y AR MUDE"
          allow="autoplay; camera; xr-spatial-tracking; fullscreen"
        ></iframe>
      </section>
    </div>
  `;
}

function renderStampCelebrationModal() {
  if (!state.showStampCelebration) {
    return "";
  }

  return `
    <div class="modal-overlay modal-overlay--scanner" data-backdrop="stamp-celebration">
      <section class="scanner-modal animate-fade-in">
        <div class="scanner-success">
          <div class="scanner-success__emoji">${state.showStampCelebration.icon}</div>
          <div class="scanner-success__panel">
            <div class="scanner-success__check">
              ${renderIcon("check-circle", { size: 28 })}
            </div>
            <h3>Sello desbloqueado</h3>
            <p>Capturaste la experiencia de ${escapeHtml(state.showStampCelebration.name)}.</p>
            <button class="primary-button" data-action="go-passport">Ver mi pasaporte</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderCheckoutModal() {
  if (!state.showCheckout) {
    return "";
  }

  const cartTotal = getCartTotal();

  return `
    <div class="modal-overlay" data-backdrop="checkout">
      <section class="modal-card modal-card--checkout animate-fade-in">
        <button class="icon-button icon-button--ghost modal-card__close" data-action="close-checkout" aria-label="Cerrar pago">
          ${renderIcon("x", { size: 20 })}
        </button>

        <h3 class="modal-title">
          ${renderIcon("credit-card", { size: 18 })}
          Pasarela de pago
        </h3>

        <div class="checkout-summary">
          <p class="checkout-summary__label">Resumen de compra</p>
          ${state.cart
            .map(
              (item) => `
                <div class="checkout-summary__row">
                  <span>${escapeHtml(item.name)}</span>
                  <strong>${formatCurrency(item.price)}</strong>
                </div>
              `
            )
            .join("")}
          <div class="checkout-summary__total">
            <span>Total a pagar</span>
            <strong>${formatCurrency(cartTotal)}</strong>
          </div>
        </div>

        <form class="checkout-form" data-form="checkout">
          <label>
            <span>Numero de tarjeta (simulador)</span>
            <input type="text" name="cardNumber" placeholder="4242 4242 4242 4242" required />
          </label>
          <div class="checkout-form__grid">
            <label>
              <span>Fecha exp</span>
              <input type="text" name="expiry" placeholder="MM/AA" required />
            </label>
            <label>
              <span>CVC</span>
              <input type="text" name="cvc" placeholder="123" required />
            </label>
          </div>
          <button class="success-button success-button--wide" type="submit" ${state.isProcessingPayment ? "disabled" : ""}>
            ${state.isProcessingPayment ? "Procesando pago..." : `Pagar ${formatCurrency(cartTotal)}`}
          </button>
        </form>
      </section>
    </div>
  `;
}

function renderQRCodeModal() {
  if (!state.showQRModal) {
    return "";
  }

  const qrData = JSON.stringify({
    id: state.showQRModal.id,
    items: state.showQRModal.items.length,
    total: state.showQRModal.total,
    date: state.showQRModal.date,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    qrData
  )}&color=3a2412`;

  return `
    <div class="modal-overlay" data-backdrop="qr">
      <section class="modal-card modal-card--qr animate-fade-in">
        <button class="icon-button icon-button--ghost modal-card__close" data-action="close-qr" aria-label="Cerrar QR">
          ${renderIcon("x", { size: 20 })}
        </button>

        <div class="purchase-success">
          <div class="purchase-success__icon">
            ${renderIcon("check-circle", { size: 28 })}
          </div>
          <h3>Compra exitosa</h3>
          <p>Muestra este codigo en la entrada o taquilla especial.</p>
        </div>

        <div class="qr-ticket">
          <div class="qr-ticket__cut qr-ticket__cut--left"></div>
          <div class="qr-ticket__cut qr-ticket__cut--right"></div>
          <img src="${qrUrl}" alt="Boleto QR dinamico" />
          <p>ID: ${escapeHtml(state.showQRModal.id)}</p>
        </div>

        <div class="ticket-items">
          ${state.showQRModal.items
            .map(
              (item) => `
                <div class="ticket-items__row">
                  ${renderIcon("ticket", { size: 14 })}
                  <span>${escapeHtml(item.name)}</span>
                </div>
              `
            )
            .join("")}
        </div>

        <button class="primary-button primary-button--wide" data-action="close-qr">
          Guardar en mi pasaporte
        </button>
      </section>
    </div>
  `;
}

async function handleAuthFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  state.authError = "";
  state.authMessage = "";

  if (state.authMode === "signup" && password !== confirmPassword) {
    state.authError = "Las contrasenas no coinciden.";
    renderApp();
    return;
  }

  state.isAuthSubmitting = true;
  renderApp();

  try {
    if (state.authMode === "signup") {
      await createUserWithEmailAndPassword(auth, email, password);
      state.authMessage = "Tu cuenta fue creada correctamente.";
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    state.authError = getAuthErrorMessage(error);
  } finally {
    state.isAuthSubmitting = false;
    renderApp();
  }
}

async function handleGoogleLogin() {
  state.authError = "";
  state.authMessage = "";
  state.isAuthSubmitting = true;
  renderApp();

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    state.authError = getAuthErrorMessage(error);
  } finally {
    state.isAuthSubmitting = false;
    renderApp();
  }
}

async function handleLogout() {
  state.authStatus = "loading";
  renderApp();

  try {
    await signOut(auth);
  } catch (error) {
    state.authStatus = "authenticated";
    state.authError = "No se pudo cerrar la sesion. Intenta de nuevo.";
    renderApp();
  }
}

function handleAction(action, dataset) {
  switch (action) {
    case "set-tab":
      state.activeTab = dataset.tab;
      renderApp();
      return;
    case "set-auth-mode":
      state.authMode = dataset.mode === "signup" ? "signup" : "login";
      state.authError = "";
      state.authMessage = "";
      state.isAuthSubmitting = false;
      renderApp();
      return;
    case "google-login":
      handleGoogleLogin();
      return;
    case "logout":
      handleLogout();
      return;
    case "open-stamp-ar":
      state.showModelViewer = getPavilionById(dataset.pavilionId);
      renderApp();
      return;
    case "open-ar":
      openArScanner(dataset.pavilionId);
      return;
    case "close-ar":
      closeArScanner();
      return;
    case "close-ar-experience":
      state.showARExperience = null;
      renderApp();
      return;
    case "close-model-viewer":
      state.showModelViewer = null;
      renderApp();
      return;
    case "go-passport":
    case "view-passport-after-scan":
      state.showARScanner = null;
      state.showStampCelebration = null;
      state.activeTab = "passport";
      renderApp();
      return;
    case "add-to-cart": {
      const product = getProductById(dataset.productId);
      if (!product) {
        return;
      }
      state.cart = [...state.cart, product];
      persistUserData();
      renderApp();
      return;
    }
    case "open-checkout":
      if (state.cart.length > 0) {
        state.showCheckout = true;
        renderApp();
      }
      return;
    case "close-checkout":
      if (!state.isProcessingPayment) {
        state.showCheckout = false;
        renderApp();
      }
      return;
    case "open-qr": {
      const purchase = getPurchaseById(dataset.purchaseId);
      if (!purchase) {
        return;
      }
      state.showQRModal = purchase;
      renderApp();
      return;
    }
    case "close-qr":
      state.showQRModal = null;
      renderApp();
      return;
    case "toggle-lang":
      state.ai.lang = state.ai.lang === "es" ? "en" : "es";
      renderApp();
      return;
    default:
      return;
  }
}

function openArScanner(pavilionId) {
  const pavilion = getPavilionById(pavilionId);
  if (!pavilion) {
    return;
  }

  if (pavilion.id === 1) {
    state.showARExperience = pavilion;
    renderApp();
    return;
  }

  clearTimeout(timers.arScanner);
  state.showARScanner = pavilion;
  state.arScanned = false;
  renderApp();

  timers.arScanner = window.setTimeout(() => {
    state.arScanned = true;
    if (!state.unlockedStamps.includes(pavilion.id)) {
      state.unlockedStamps = [...state.unlockedStamps, pavilion.id];
      persistUserData();
    }
    renderApp();
  }, 2500);
}

function closeArScanner() {
  clearTimeout(timers.arScanner);
  state.showARScanner = null;
  state.arScanned = false;
  renderApp();
}

function handleCheckout(event) {
  event.preventDefault();

  if (state.isProcessingPayment || state.cart.length === 0) {
    return;
  }

  state.isProcessingPayment = true;
  renderApp();

  clearTimeout(timers.payment);
  timers.payment = window.setTimeout(async () => {
    const newPurchase = {
      id: `TXN-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`,
      items: [...state.cart],
      total: getCartTotal(),
      date: new Date().toLocaleString("es-MX"),
    };

    state.purchases = [newPurchase, ...state.purchases];
    state.cart = [];
    state.isProcessingPayment = false;
    state.showCheckout = false;
    state.showQRModal = newPurchase;
    state.activeTab = "passport";
    await persistUserData();
    renderApp();
  }, 2000);
}

function handleChatSubmit(event) {
  event.preventDefault();
  const message = state.ai.input.trim();
  const replyLanguage = state.ai.lang;

  if (!message) {
    return;
  }

  state.ai.messages = [
    ...state.ai.messages,
    { id: Date.now(), text: message, sender: "user" },
  ];
  state.ai.input = "";
  renderApp();

  window.setTimeout(() => {
    state.ai.messages = [
      ...state.ai.messages,
      {
        id: Date.now() + 1,
        text: getBotResponse(message, replyLanguage),
        sender: "bot",
      },
    ];
    renderApp();
  }, 1000);
}

function getBotResponse(input, lang) {
  const question = input.toLowerCase();

  if (lang === "en") {
    if (question.includes("hour") || question.includes("close")) {
      return "The museum is open from Tuesday to Sunday, 10:00 to 17:00. Ticket counters close at 17:00.";
    }

    if (question.includes("t-rex") || question.includes("tyrannosaurus")) {
      return "The Tyrannosaurus rex is one of the most famous predators. In Pavilion 1 you can find a striking skeletal replica and an AR interaction.";
    }

    return "I am Fidencio, your virtual guide. You can explore fossils from Coahuila, visit the pavilions, and use the AR passport during your visit.";
  }

  if (question.includes("t-rex") || question.includes("tiranosaurio")) {
    return "El Tiranosaurio rex fue uno de los depredadores mas grandes. En el Pabellon 1 puedes ver una replica impresionante e interactuar con ella en realidad aumentada.";
  }

  if (question.includes("hora") || question.includes("horario") || question.includes("cierra")) {
    return "El museo esta abierto de martes a domingo de 10:00 a 17:00 horas. Las taquillas cierran a las 17:00 horas.";
  }

  return "Interesante pregunta. El Museo del Desierto resguarda fosiles unicos de Coahuila y una coleccion enfocada en la historia natural del desierto.";
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    handleAction(actionButton.dataset.action, actionButton.dataset);
    return;
  }

  const backdrop = event.target.dataset.backdrop;
  if (backdrop === "ar") {
    closeArScanner();
  }

  if (backdrop === "ar-experience") {
    state.showARExperience = null;
    renderApp();
  }

  if (backdrop === "model-viewer") {
    state.showModelViewer = null;
    renderApp();
  }

  if (backdrop === "stamp-celebration") {
    state.showStampCelebration = null;
    renderApp();
  }

  if (backdrop === "checkout" && !state.isProcessingPayment) {
    state.showCheckout = false;
    renderApp();
  }

  if (backdrop === "qr") {
    state.showQRModal = null;
    renderApp();
  }
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data?.type === "mude-ar-stamp-earned") {
    const pavilion = getPavilionById(event.data.pavilionId);
    if (!pavilion) {
      return;
    }

    if (!state.unlockedStamps.includes(pavilion.id)) {
      state.unlockedStamps = [...state.unlockedStamps, pavilion.id];
      persistUserData();
    }

    state.showARExperience = null;
    state.showStampCelebration = pavilion;
    renderApp();
    return;
  }

  if (event.data?.type === "mude-close-viewer") {
    state.showModelViewer = null;
    renderApp();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-role='chat-input']")) {
    state.ai.input = event.target.value;
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-form='auth']")) {
    handleAuthFormSubmit(event);
  }

  if (event.target.matches("[data-form='checkout']")) {
    handleCheckout(event);
  }

  if (event.target.matches("[data-form='chat']")) {
    handleChatSubmit(event);
  }
});

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    state.user = null;
    resetInteractiveState();
    state.authStatus = "unauthenticated";
    state.isAuthSubmitting = false;
    renderApp();
    return;
  }

  await hydrateUserState(firebaseUser);
  state.isAuthSubmitting = false;
  renderApp();
});

renderApp();
