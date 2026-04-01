import {
  DEFAULT_COORDS,
  LANGUAGES,
  TRAVEL_CATEGORIES,
  UI,
  WEATHER_CODES,
  WEATHER_TEXT,
} from "./visita-i18n.js";
import { auth, database, googleProvider } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  get,
  ref,
  serverTimestamp,
  set,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const GOOGLE_API_KEY = "AIzaSyAQMIAQGfVignXGUO_IUkwWpoKqX77OaaI";
const OPENAI_API_KEY = "Openai Apikey";
const OPENAI_TOKEN_ENDPOINT = "https://ia-641197532873.us-central1.run.app";
const EXPERIENCE_VERSION = "20260331h";
const LOCAL_LANGUAGE_KEY = "travel-language";
const LOCAL_LANGUAGE_CONFIRMED_KEY = "travel-language-confirmed";
const LOCAL_PLAN_KEY = "travel-plan";
const DEFAULT_CHAT_LIMIT = 30;
const DEFAULT_MEMORY_SUMMARY =
  "Not enough stable traveler preferences yet. Start with brief questions about style, budget, and companions.";

const EXTRA_UI = {
  es: {
    authEyebrow: "Cuenta personal",
    authTitle: "Entra para guardar idioma, planes y conversaciones.",
    authSubtitle:
      "Tu cuenta mantiene historial por turista, varios chats y una memoria ligera para que la guia recuerde tus gustos.",
    authBullet1Title: "Preferencias persistentes",
    authBullet1Text: "Idioma, ritmo, presupuesto y actividades favoritas se guardan con tu cuenta.",
    authBullet2Title: "Varios chats",
    authBullet2Text: "Puedes separar un chat para familia, otro para vino, otro para comida o escapadas cortas.",
    authBullet3Title: "Contexto continuo",
    authBullet3Text: "La IA recibe tu plan, ubicacion, clima y una memoria resumida del viajero.",
    authLogin: "Iniciar sesion",
    authSignup: "Crear cuenta",
    authName: "Nombre",
    authEmail: "Correo",
    authPassword: "Contrasena",
    authSubmitLogin: "Entrar a mi asistente",
    authSubmitSignup: "Crear cuenta y continuar",
    authDivider: "o entra con",
    authGoogle: "Continuar con Google",
    authLegal: "Tus planes y chats se guardan en tu cuenta para retomar la visita despues.",
    logout: "Cerrar sesion",
    chatsHeading: "Chats del viajero",
    chatsHint: "Cada chat conserva su propio hilo y su plan puede seguir afinandose.",
    newChat: "Nuevo chat",
    emptyChats: "Aun no hay chats. Crea uno para empezar.",
    youLabel: "Tu",
    accountPrefix: "Cuenta",
    threadFresh: "Sin mensajes todavia",
    threadNow: "Activo ahora",
    savedLabel: "Guardado por usuario",
    loginRequired: "Necesitas iniciar sesion para activar memoria, chats y plan persistente.",
    starterChatTitle: "Nuevo plan",
  },
  en: {
    authEyebrow: "Personal account",
    authTitle: "Sign in to save language, plans, and conversations.",
    authSubtitle:
      "Your account keeps traveler-specific history, multiple chats, and lightweight memory so the guide remembers your style.",
    authBullet1Title: "Persistent preferences",
    authBullet1Text: "Language, pace, budget, and favorite activities stay with your account.",
    authBullet2Title: "Multiple chats",
    authBullet2Text: "Create one chat for family, another for wine, food, or quick getaways.",
    authBullet3Title: "Continuous context",
    authBullet3Text: "The AI receives your plan, location, weather, and a summarized traveler memory.",
    authLogin: "Sign in",
    authSignup: "Create account",
    authName: "Name",
    authEmail: "Email",
    authPassword: "Password",
    authSubmitLogin: "Open my assistant",
    authSubmitSignup: "Create account and continue",
    authDivider: "or continue with",
    authGoogle: "Continue with Google",
    authLegal: "Your plans and chats stay attached to your account so you can return later.",
    logout: "Sign out",
    chatsHeading: "Traveler chats",
    chatsHint: "Each chat keeps its own thread so your planning can branch naturally.",
    newChat: "New chat",
    emptyChats: "No chats yet. Create one to begin.",
    youLabel: "You",
    accountPrefix: "Account",
    threadFresh: "No messages yet",
    threadNow: "Active now",
    savedLabel: "Saved per user",
    loginRequired: "Sign in to enable memory, chats, and persistent planning.",
    starterChatTitle: "New plan",
  },
  fr: {
    authEyebrow: "Compte personnel",
    authTitle: "Connectez-vous pour enregistrer langue, plans et conversations.",
    authSubtitle:
      "Votre compte conserve l'historique du voyageur, plusieurs chats et une memoire legere pour personnaliser le guide.",
    authBullet1Title: "Preferences persistantes",
    authBullet1Text: "Langue, rythme, budget et activites favorites restent lies a votre compte.",
    authBullet2Title: "Plusieurs chats",
    authBullet2Text: "Creez un chat pour la famille, un autre pour le vin, la gastronomie ou une sortie rapide.",
    authBullet3Title: "Contexte continu",
    authBullet3Text: "L'IA recoit votre plan, localisation, meteo et une memoire resumee du voyageur.",
    authLogin: "Se connecter",
    authSignup: "Creer un compte",
    authName: "Nom",
    authEmail: "E-mail",
    authPassword: "Mot de passe",
    authSubmitLogin: "Ouvrir mon assistant",
    authSubmitSignup: "Creer le compte et continuer",
    authDivider: "ou continuer avec",
    authGoogle: "Continuer avec Google",
    authLegal: "Vos plans et chats restent sur votre compte pour reprendre plus tard.",
    logout: "Se deconnecter",
    chatsHeading: "Chats du voyageur",
    chatsHint: "Chaque chat garde son propre fil pour organiser plusieurs idees de visite.",
    newChat: "Nouveau chat",
    emptyChats: "Aucun chat pour le moment.",
    youLabel: "Vous",
    accountPrefix: "Compte",
    threadFresh: "Aucun message",
    threadNow: "Actif",
    savedLabel: "Sauvegarde utilisateur",
    loginRequired: "Connectez-vous pour activer memoire, chats et plan persistant.",
    starterChatTitle: "Nouveau plan",
  },
  pt: {
    authEyebrow: "Conta pessoal",
    authTitle: "Entre para salvar idioma, planos e conversas.",
    authSubtitle:
      "Sua conta guarda historico do viajante, varios chats e memoria leve para personalizar o guia.",
    authBullet1Title: "Preferencias persistentes",
    authBullet1Text: "Idioma, ritmo, orcamento e atividades favoritas ficam na sua conta.",
    authBullet2Title: "Varios chats",
    authBullet2Text: "Crie um chat para familia, outro para vinho, gastronomia ou passeios curtos.",
    authBullet3Title: "Contexto continuo",
    authBullet3Text: "A IA recebe seu plano, localizacao, clima e uma memoria resumida do viajante.",
    authLogin: "Entrar",
    authSignup: "Criar conta",
    authName: "Nome",
    authEmail: "E-mail",
    authPassword: "Senha",
    authSubmitLogin: "Abrir meu assistente",
    authSubmitSignup: "Criar conta e continuar",
    authDivider: "ou entrar com",
    authGoogle: "Continuar com Google",
    authLegal: "Seus planos e chats ficam salvos para continuar depois.",
    logout: "Sair",
    chatsHeading: "Chats do viajante",
    chatsHint: "Cada chat mantem seu proprio contexto.",
    newChat: "Novo chat",
    emptyChats: "Ainda nao ha chats.",
    youLabel: "Voce",
    accountPrefix: "Conta",
    threadFresh: "Sem mensagens ainda",
    threadNow: "Ativo",
    savedLabel: "Salvo por usuario",
    loginRequired: "Entre para ativar memoria, chats e plano persistente.",
    starterChatTitle: "Novo plano",
  },
  ja: {
    authEyebrow: "個人アカウント",
    authTitle: "言語、プラン、会話を保存するにはログインしてください。",
    authSubtitle:
      "アカウントごとに履歴、複数チャット、旅行者メモを保持し、案内をより個別化します。",
    authBullet1Title: "設定を保存",
    authBullet1Text: "言語、予算、旅のテンポ、好みを保存します。",
    authBullet2Title: "複数チャット",
    authBullet2Text: "家族旅行、ワイン、食事などテーマ別に会話を分けられます。",
    authBullet3Title: "継続コンテキスト",
    authBullet3Text: "AI はプラン、位置情報、天気、要約メモを受け取ります。",
    authLogin: "ログイン",
    authSignup: "アカウント作成",
    authName: "名前",
    authEmail: "メール",
    authPassword: "パスワード",
    authSubmitLogin: "アシスタントを開く",
    authSubmitSignup: "作成して続行",
    authDivider: "または",
    authGoogle: "Google で続行",
    authLegal: "プランとチャットは後で再開できるよう保存されます。",
    logout: "ログアウト",
    chatsHeading: "旅行チャット",
    chatsHint: "各チャットは独自の会話の流れを保ちます。",
    newChat: "新しいチャット",
    emptyChats: "まだチャットがありません。",
    youLabel: "あなた",
    accountPrefix: "アカウント",
    threadFresh: "まだメッセージなし",
    threadNow: "現在アクティブ",
    savedLabel: "ユーザー保存",
    loginRequired: "メモリ、チャット、保存プランにはログインが必要です。",
    starterChatTitle: "新しいプラン",
  },
  ko: {
    authEyebrow: "개인 계정",
    authTitle: "언어, 플랜, 대화를 저장하려면 로그인하세요.",
    authSubtitle:
      "계정별로 여행자 기록, 여러 채팅, 가벼운 메모리를 보관해 더 맞춤형 안내를 제공합니다.",
    authBullet1Title: "환경 저장",
    authBullet1Text: "언어, 예산, 여행 속도, 선호 활동을 계정에 저장합니다.",
    authBullet2Title: "여러 채팅",
    authBullet2Text: "가족 여행, 와인, 음식처럼 주제별 채팅을 만들 수 있습니다.",
    authBullet3Title: "연속 컨텍스트",
    authBullet3Text: "AI 는 플랜, 위치, 날씨, 요약 메모를 함께 받습니다.",
    authLogin: "로그인",
    authSignup: "계정 만들기",
    authName: "이름",
    authEmail: "이메일",
    authPassword: "비밀번호",
    authSubmitLogin: "어시스턴트 열기",
    authSubmitSignup: "계정 만들고 계속",
    authDivider: "또는",
    authGoogle: "Google로 계속",
    authLegal: "플랜과 채팅은 나중에 이어서 볼 수 있도록 저장됩니다.",
    logout: "로그아웃",
    chatsHeading: "여행자 채팅",
    chatsHint: "각 채팅은 자체 대화 흐름을 유지합니다.",
    newChat: "새 채팅",
    emptyChats: "아직 채팅이 없습니다.",
    youLabel: "나",
    accountPrefix: "계정",
    threadFresh: "아직 메시지 없음",
    threadNow: "현재 활성",
    savedLabel: "사용자별 저장",
    loginRequired: "메모리, 채팅, 저장 플랜을 쓰려면 로그인하세요.",
    starterChatTitle: "새 플랜",
  },
  ar: {
    authEyebrow: "حساب شخصي",
    authTitle: "سجل الدخول لحفظ اللغة والخطط والمحادثات.",
    authSubtitle:
      "يحفظ الحساب سجل المسافر وعدة محادثات وذاكرة خفيفة لتخصيص الدليل.",
    authBullet1Title: "تفضيلات محفوظة",
    authBullet1Text: "اللغة والميزانية والإيقاع والاهتمامات تبقى مرتبطة بحسابك.",
    authBullet2Title: "عدة محادثات",
    authBullet2Text: "يمكنك إنشاء محادثة للعائلة وأخرى للنبيذ أو الطعام أو الرحلات القصيرة.",
    authBullet3Title: "سياق مستمر",
    authBullet3Text: "يتلقى الذكاء الاصطناعي خطتك وموقعك والطقس وملخصا عن تفضيلاتك.",
    authLogin: "تسجيل الدخول",
    authSignup: "إنشاء حساب",
    authName: "الاسم",
    authEmail: "البريد الإلكتروني",
    authPassword: "كلمة المرور",
    authSubmitLogin: "فتح المساعد",
    authSubmitSignup: "إنشاء الحساب والمتابعة",
    authDivider: "أو المتابعة عبر",
    authGoogle: "المتابعة مع Google",
    authLegal: "يتم حفظ خططك ومحادثاتك للعودة إليها لاحقا.",
    logout: "تسجيل الخروج",
    chatsHeading: "محادثات المسافر",
    chatsHint: "كل محادثة تحتفظ بسياقها الخاص.",
    newChat: "محادثة جديدة",
    emptyChats: "لا توجد محادثات بعد.",
    youLabel: "أنت",
    accountPrefix: "الحساب",
    threadFresh: "لا توجد رسائل بعد",
    threadNow: "نشط الآن",
    savedLabel: "محفوظ لكل مستخدم",
    loginRequired: "سجل الدخول لتفعيل الذاكرة والمحادثات والخطة المحفوظة.",
    starterChatTitle: "خطة جديدة",
  },
  zh: {
    authEyebrow: "个人账户",
    authTitle: "登录后即可保存语言、行程和对话。",
    authSubtitle:
      "账户会保存旅行者历史、多个聊天和轻量记忆，让导游更懂你。",
    authBullet1Title: "偏好可持续保存",
    authBullet1Text: "语言、预算、节奏和喜欢的活动都会保存在你的账户中。",
    authBullet2Title: "多个聊天",
    authBullet2Text: "你可以为家庭、葡萄酒、美食或短途行程分别创建聊天。",
    authBullet3Title: "连续上下文",
    authBullet3Text: "AI 会收到你的计划、位置、天气和旅行者摘要记忆。",
    authLogin: "登录",
    authSignup: "创建账户",
    authName: "姓名",
    authEmail: "邮箱",
    authPassword: "密码",
    authSubmitLogin: "打开我的助手",
    authSubmitSignup: "创建账户并继续",
    authDivider: "或使用",
    authGoogle: "使用 Google 继续",
    authLegal: "你的计划和聊天会保存在账户中，方便稍后继续。",
    logout: "退出登录",
    chatsHeading: "旅行聊天",
    chatsHint: "每个聊天都会保留自己的上下文。",
    newChat: "新建聊天",
    emptyChats: "还没有聊天。",
    youLabel: "你",
    accountPrefix: "账户",
    threadFresh: "还没有消息",
    threadNow: "当前活动",
    savedLabel: "按用户保存",
    loginRequired: "登录后即可启用记忆、聊天和持久化行程。",
    starterChatTitle: "新计划",
  },
  de: {
    authEyebrow: "Persoenliches Konto",
    authTitle: "Melde dich an, um Sprache, Plaene und Gespraeche zu speichern.",
    authSubtitle:
      "Dein Konto behaelt Reiseverlauf, mehrere Chats und eine leichte Erinnerung fuer persoenliche Empfehlungen.",
    authBullet1Title: "Dauerhafte Vorlieben",
    authBullet1Text: "Sprache, Tempo, Budget und Lieblingsaktivitaeten bleiben mit deinem Konto verknuepft.",
    authBullet2Title: "Mehrere Chats",
    authBullet2Text: "Erstelle getrennte Chats fuer Familie, Wein, Essen oder kurze Ausfluege.",
    authBullet3Title: "Fortlaufender Kontext",
    authBullet3Text: "Die KI erhaelt deinen Plan, Standort, Wetter und eine zusammengefasste Reisememo.",
    authLogin: "Anmelden",
    authSignup: "Konto erstellen",
    authName: "Name",
    authEmail: "E-Mail",
    authPassword: "Passwort",
    authSubmitLogin: "Assistent oeffnen",
    authSubmitSignup: "Konto erstellen und weiter",
    authDivider: "oder weiter mit",
    authGoogle: "Mit Google fortfahren",
    authLegal: "Deine Plaene und Chats bleiben im Konto fuer spaeter erhalten.",
    logout: "Abmelden",
    chatsHeading: "Reise-Chats",
    chatsHint: "Jeder Chat behaelt seinen eigenen Verlauf.",
    newChat: "Neuer Chat",
    emptyChats: "Noch keine Chats vorhanden.",
    youLabel: "Du",
    accountPrefix: "Konto",
    threadFresh: "Noch keine Nachrichten",
    threadNow: "Jetzt aktiv",
    savedLabel: "Pro Nutzer gespeichert",
    loginRequired: "Melde dich an, um Erinnerung, Chats und dauerhafte Plaene zu aktivieren.",
    starterChatTitle: "Neuer Plan",
  },
};

const DEFAULT_SETTINGS = {
  language: localStorage.getItem(LOCAL_LANGUAGE_KEY) || "es",
  travelMode: "WALKING",
  micEnabled: true,
  voiceEnabled: true,
};

const state = {
  language: DEFAULT_SETTINGS.language,
  confirmedLanguage: localStorage.getItem(LOCAL_LANGUAGE_KEY) || DEFAULT_SETTINGS.language,
  languageConfirmed:
    localStorage.getItem(LOCAL_LANGUAGE_CONFIRMED_KEY) === "1"
    || Boolean(localStorage.getItem(LOCAL_LANGUAGE_KEY)),
  languageGateOpen:
    !(
      localStorage.getItem(LOCAL_LANGUAGE_CONFIRMED_KEY) === "1"
      || Boolean(localStorage.getItem(LOCAL_LANGUAGE_KEY))
    ),
  plan: loadPlan(),
  travelMode: DEFAULT_SETTINGS.travelMode,
  location: null,
  weather: null,
  nearbyPlaces: [],
  selectedPlaceId: null,
  quickSuggestion: "",
  user: null,
  authStatus: "loading",
  authMode: "login",
  authMessage: "",
  authError: "",
  isAuthSubmitting: false,
  chats: [],
  activeChatId: null,
  memorySummary: DEFAULT_MEMORY_SUMMARY,
  maps: {
    ready: false,
    loading: false,
    map: null,
    geocoder: null,
    directionsService: null,
    directionsRenderer: null,
    placesService: null,
    markers: [],
  },
  realtime: {
    pc: null,
    dc: null,
    stream: null,
    connected: false,
    connecting: false,
    micEnabled: DEFAULT_SETTINGS.micEnabled,
    voiceEnabled: DEFAULT_SETTINGS.voiceEnabled,
    activeResponseId: null,
    bufferByResponse: {},
  },
  messages: [],
};

let persistTimer = null;
let memoryTimer = null;

const els = {
  languageGate: document.getElementById("languageGate"),
  languageTitle: document.getElementById("languageTitle"),
  languageHint: document.getElementById("languageHint"),
  languageCurrent: document.getElementById("languageCurrent"),
  languageCloseBtn: document.getElementById("languageCloseBtn"),
  languageSelectLabel: document.getElementById("languageSelectLabel"),
  languageSelect: document.getElementById("languageSelect"),
  languageContinueBtn: document.getElementById("languageContinueBtn"),
  authGate: document.getElementById("authGate"),
  authEyebrow: document.getElementById("authEyebrow"),
  authTitle: document.getElementById("authTitle"),
  authSubtitle: document.getElementById("authSubtitle"),
  authBullets: document.getElementById("authBullets"),
  authLoginModeBtn: document.getElementById("authLoginModeBtn"),
  authSignupModeBtn: document.getElementById("authSignupModeBtn"),
  authMessage: document.getElementById("authMessage"),
  authError: document.getElementById("authError"),
  authForm: document.getElementById("authForm"),
  authNameField: document.getElementById("authNameField"),
  authNameLabel: document.getElementById("authNameLabel"),
  authNameInput: document.getElementById("authNameInput"),
  authEmailLabel: document.getElementById("authEmailLabel"),
  authEmailInput: document.getElementById("authEmailInput"),
  authPasswordLabel: document.getElementById("authPasswordLabel"),
  authPasswordInput: document.getElementById("authPasswordInput"),
  authSubmitBtn: document.getElementById("authSubmitBtn"),
  authDivider: document.getElementById("authDivider"),
  authGoogleBtn: document.getElementById("authGoogleBtn"),
  authLegal: document.getElementById("authLegal"),
  brandTitle: document.getElementById("brandTitle"),
  brandSubtitle: document.getElementById("brandSubtitle"),
  accountPill: document.getElementById("accountPill"),
  authLogoutBtn: document.getElementById("authLogoutBtn"),
  changeLanguageBtn: document.getElementById("changeLanguageBtn"),
  locateBtn: document.getElementById("locateBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  heroEyebrow: document.getElementById("heroEyebrow"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  locationPill: document.getElementById("locationPill"),
  weatherPill: document.getElementById("weatherPill"),
  planPill: document.getElementById("planPill"),
  suggestionHeading: document.getElementById("suggestionHeading"),
  suggestionText: document.getElementById("suggestionText"),
  assistantPreviewHeading: document.getElementById("assistantPreviewHeading"),
  assistantPreviewText: document.getElementById("assistantPreviewText"),
  keysHeading: document.getElementById("keysHeading"),
  keysText: document.getElementById("keysText"),
  locationCardLabel: document.getElementById("locationCardLabel"),
  locationCardValue: document.getElementById("locationCardValue"),
  locationCardHint: document.getElementById("locationCardHint"),
  weatherCardLabel: document.getElementById("weatherCardLabel"),
  weatherCardValue: document.getElementById("weatherCardValue"),
  weatherCardHint: document.getElementById("weatherCardHint"),
  timingCardLabel: document.getElementById("timingCardLabel"),
  timingCardValue: document.getElementById("timingCardValue"),
  timingCardHint: document.getElementById("timingCardHint"),
  mapTitle: document.getElementById("mapTitle"),
  mapSubtitle: document.getElementById("mapSubtitle"),
  travelModeGroup: document.getElementById("travelModeGroup"),
  mapCanvas: document.getElementById("mapCanvas"),
  nearbyTitle: document.getElementById("nearbyTitle"),
  nearbySubtitle: document.getElementById("nearbySubtitle"),
  nearbyGrid: document.getElementById("nearbyGrid"),
  planTitle: document.getElementById("planTitle"),
  planSubtitle: document.getElementById("planSubtitle"),
  planGrid: document.getElementById("planGrid"),
  assistantTitle: document.getElementById("assistantTitle"),
  assistantSubtitle: document.getElementById("assistantSubtitle"),
  connectBtn: document.getElementById("connectBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  contextBtn: document.getElementById("contextBtn"),
  micBtn: document.getElementById("micBtn"),
  voiceBtn: document.getElementById("voiceBtn"),
  connectionStatus: document.getElementById("connectionStatus"),
  connectionStatusText: document.getElementById("connectionStatusText"),
  locationStatusText: document.getElementById("locationStatusText"),
  assistantNotice: document.getElementById("assistantNotice"),
  chatsHeading: document.getElementById("chatsHeading"),
  chatsHint: document.getElementById("chatsHint"),
  newChatBtn: document.getElementById("newChatBtn"),
  threadList: document.getElementById("threadList"),
  quickPrompts: document.getElementById("quickPrompts"),
  chatLog: document.getElementById("chatLog"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  helperRow: document.getElementById("helperRow"),
  sendBtn: document.getElementById("sendBtn"),
  remoteAudio: document.getElementById("remoteAudio"),
};

function loadPlan() {
  try {
    const raw = localStorage.getItem(LOCAL_PLAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlan() {
  localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(state.plan));
}

function t(key) {
  return EXTRA_UI[state.language]?.[key]
    || UI[state.language]?.[key]
    || EXTRA_UI.en[key]
    || UI.en?.[key]
    || key;
}

function langMeta(code = state.language) {
  return LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];
}

function isConfigured(value) {
  return value && !/apikey/i.test(value);
}

function hasRealtimeAuth() {
  return Boolean(OPENAI_TOKEN_ENDPOINT) || isConfigured(OPENAI_API_KEY);
}

function weatherLabel(code) {
  const key = WEATHER_CODES[code] || "clear";
  return WEATHER_TEXT[state.language][key] || WEATHER_TEXT.en[key];
}

function formatTemperature(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°C` : "--";
}

function formatPriceLevel(level) {
  if (!Number.isFinite(level) || level <= 0) {
    return t("unknownPrice");
  }
  return `${t("budgetLabel")}: ${"$".repeat(level)}`;
}

function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat(state.language, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createChat(overrides = {}) {
  const now = Date.now();
  return {
    id: overrides.id || `chat-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title || t("starterChatTitle"),
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    messages: Array.isArray(overrides.messages) ? overrides.messages : [],
  };
}

function getActiveChat() {
  return state.chats.find((chat) => chat.id === state.activeChatId) || null;
}

function syncMessagesFromActiveChat() {
  state.messages = getActiveChat()?.messages || [];
}

function sanitizeChatMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }

  const role = message.role === "assistant" ? "assistant" : "user";
  const text = String(message.text || "").trim();

  if (!text) {
    return null;
  }

  return {
    id: String(message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    role,
    text,
    createdAt: Number(message.createdAt) || Date.now(),
  };
}

function sanitizeChats(chats) {
  const safeChats = Array.isArray(chats)
    ? chats
        .map((chat) => {
          if (!chat || typeof chat !== "object") {
            return null;
          }

          const messages = Array.isArray(chat.messages)
            ? chat.messages.map(sanitizeChatMessage).filter(Boolean)
            : [];

          return createChat({
            id: chat.id,
            title: String(chat.title || t("starterChatTitle")).trim() || t("starterChatTitle"),
            createdAt: Number(chat.createdAt) || Date.now(),
            updatedAt: Number(chat.updatedAt) || Number(chat.createdAt) || Date.now(),
            messages,
          });
        })
        .filter(Boolean)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    : [];

  return safeChats.length ? safeChats : [createChat()];
}

function setChats(chats, nextActiveChatId = null) {
  state.chats = sanitizeChats(chats);
  state.activeChatId = state.chats.some((chat) => chat.id === nextActiveChatId)
    ? nextActiveChatId
    : state.chats[0].id;
  syncMessagesFromActiveChat();
}

function getRecentTranscript(limit = 8) {
  return state.messages.slice(-limit).map((message) => `${message.role}: ${message.text}`).join("\n");
}

function updateChatMetadata(chatId) {
  state.chats = state.chats
    .map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }

      const firstUserMessage = chat.messages.find((message) => message.role === "user");
      const title = firstUserMessage
        ? firstUserMessage.text.split(/[.!?\n]/)[0].slice(0, 52).trim() || chat.title
        : chat.title;

      return {
        ...chat,
        title: title || t("starterChatTitle"),
        updatedAt: Date.now(),
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
  state.activeChatId = chatId;
  syncMessagesFromActiveChat();
}

function buildTravelerMemory() {
  const userMessages = state.chats
    .flatMap((chat) => chat.messages)
    .filter((message) => message.role === "user")
    .map((message) => message.text.toLowerCase());

  const tags = new Set();
  const source = userMessages.join(" ");

  if (/\bromantic|romantico|romántico|pareja\b/.test(source)) tags.add("romantic plans");
  if (/\bfamily|familia|kids|niños|ninos\b/.test(source)) tags.add("family-friendly options");
  if (/\bquiet|tranquilo|relax|calmado|calmo\b/.test(source)) tags.add("calm pacing");
  if (/\badventure|aventura|outdoor|aire libre\b/.test(source)) tags.add("outdoor interest");
  if (/\bmuseum|museo|history|historia\b/.test(source)) tags.add("culture and history");
  if (/\bfood|comida|gastronom|restaurant|restaurante\b/.test(source)) tags.add("local food");
  if (/\bwine|vino|vinicola|vineyard\b/.test(source)) tags.add("wine experiences");
  if (/\bbudget|cheap|barato|econ[oó]m/i.test(source)) tags.add("budget-aware");
  if (/\bluxury|lujo|premium\b/.test(source)) tags.add("premium comfort");

  if (state.plan.some((place) => place.category === "museum")) {
    tags.add("saved museum stops");
  }
  if (state.plan.some((place) => place.category === "restaurant" || place.category === "cafe")) {
    tags.add("saved food stops");
  }

  if (!tags.size) {
    return DEFAULT_MEMORY_SUMMARY;
  }

  const language = langMeta().label;
  return `Traveler profile in ${language}: ${[...tags].join(", ")}. Current saved activities: ${
    state.plan.map((place) => place.name).join(", ") || "none yet"
  }.`;
}

function scheduleMemoryRefresh() {
  clearTimeout(memoryTimer);
  memoryTimer = setTimeout(() => {
    state.memorySummary = buildTravelerMemory();
    schedulePersist();
    if (state.realtime.connected) {
      updateRealtimeSession();
    }
  }, 300);
}

function getTravelerPayload() {
  return {
    profile: {
      displayName: state.user?.displayName || "",
      email: state.user?.email || "",
      photoURL: state.user?.photoURL || "",
      experienceVersion: EXPERIENCE_VERSION,
      updatedAt: Date.now(),
      updatedAtServer: serverTimestamp(),
    },
    settings: {
      language: state.language,
      travelMode: state.travelMode,
      micEnabled: state.realtime.micEnabled,
      voiceEnabled: state.realtime.voiceEnabled,
    },
    plan: state.plan,
    chats: state.chats,
    activeChatId: state.activeChatId,
    memorySummary: state.memorySummary,
  };
}

async function persistTravelerData() {
  if (!state.user?.uid) {
    savePlan();
    localStorage.setItem(LOCAL_LANGUAGE_KEY, state.language);
    return;
  }

  try {
    await set(ref(database, `users/${state.user.uid}/visita`), getTravelerPayload());
  } catch (error) {
    console.error("Could not save traveler data.", error);
  }
}

function schedulePersist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTravelerData().catch((error) => console.error(error));
  }, 250);
}

function findPlace(placeId) {
  return state.nearbyPlaces.find((place) => place.id === placeId)
    || state.plan.find((place) => place.id === placeId);
}

function buildWeatherMood() {
  const temperature = state.weather?.current_weather?.temperature;
  const code = state.weather?.current_weather?.weathercode;
  if (Number.isFinite(temperature) && temperature >= 32) {
    return t("weatherMoodHot");
  }
  if (["rain", "drizzle", "showers", "storm"].includes(WEATHER_CODES[code])) {
    return t("weatherMoodRain");
  }
  return t("weatherMoodSunny");
}

function buildQuickSuggestion() {
  const attraction = state.nearbyPlaces.find((place) => place.category === "tourist_attraction")
    || state.nearbyPlaces[0];
  const food = state.nearbyPlaces.find((place) => place.category === "restaurant")
    || state.nearbyPlaces.find((place) => place.category === "cafe");
  const head = state.location?.displayName || DEFAULT_COORDS.name;

  switch (state.language) {
    case "en":
      return `You are around ${head}. ${buildWeatherMood()} ${
        attraction ? `Start with ${attraction.name}` : "Begin nearby"
      }${food ? ` and then pause at ${food.name}.` : "."}`;
    case "fr":
      return `Vous êtes près de ${head}. ${buildWeatherMood()} ${
        attraction ? `Commencez par ${attraction.name}` : "Commencez près d’ici"
      }${food ? ` puis faites une pause chez ${food.name}.` : "."}`;
    case "pt":
      return `Você está por ${head}. ${buildWeatherMood()} ${
        attraction ? `Comece por ${attraction.name}` : "Comece por algo próximo"
      }${food ? ` e depois faça uma pausa em ${food.name}.` : "."}`;
    case "ja":
      return `${head} 周辺にいます。${buildWeatherMood()} ${
        attraction ? `${attraction.name} から始めるのがよさそうです。` : "近くから始めるのがよさそうです。"
      }${food ? `${food.name} に立ち寄る流れも合いそうです。` : ""}`;
    case "ko":
      return `${head} 근처에 있습니다. ${buildWeatherMood()} ${
        attraction ? `${attraction.name}부터 시작해 보세요.` : "가까운 곳부터 시작해 보세요."
      }${food ? ` 이어서 ${food.name}에 들르는 흐름이 좋습니다.` : ""}`;
    case "ar":
      return `أنت الآن بالقرب من ${head}. ${buildWeatherMood()} ${
        attraction ? `ابدأ بـ ${attraction.name}` : "ابدأ من مكان قريب"
      }${food ? ` ثم توقف عند ${food.name}.` : "."}`;
    case "zh":
      return `你现在位于 ${head} 附近。${buildWeatherMood()} ${
        attraction ? `可以先去 ${attraction.name}` : "可以先从附近开始"
      }${food ? `，再到 ${food.name} 休息一下。` : "。"} `;
    case "de":
      return `Du bist in der Nähe von ${head}. ${buildWeatherMood()} ${
        attraction ? `Starte mit ${attraction.name}` : "Starte in der Nähe"
      }${food ? ` und mach danach eine Pause bei ${food.name}.` : "."}`;
    default:
      return `Estás cerca de ${head}. ${buildWeatherMood()} ${
        attraction ? `Podrías empezar por ${attraction.name}` : "Podrías empezar cerca de aquí"
      }${food ? ` y luego pasar a ${food.name}.` : "."}`;
  }
}

function pushMessage(role, text, id = `msg-${Date.now()}-${Math.random()}`) {
  const activeChat = getActiveChat();
  if (!activeChat) {
    return id;
  }

  const message = {
    id,
    role,
    text: String(text || "").trim(),
    createdAt: Date.now(),
  };

  activeChat.messages = [...activeChat.messages, message];
  updateChatMetadata(activeChat.id);
  scheduleMemoryRefresh();
  schedulePersist();
  renderChat();
  renderThreads();
  return id;
}

function updateMessage(id, text) {
  const activeChat = getActiveChat();
  if (!activeChat) {
    return;
  }

  activeChat.messages = activeChat.messages.map((message) =>
    message.id === id ? { ...message, text, updatedAt: Date.now() } : message
  );
  updateChatMetadata(activeChat.id);
  schedulePersist();
  syncMessagesFromActiveChat();
  renderChat();
  renderThreads();
}

function removeMessage(id) {
  const activeChat = getActiveChat();
  if (!activeChat) {
    return;
  }

  activeChat.messages = activeChat.messages.filter((message) => message.id !== id);
  updateChatMetadata(activeChat.id);
  scheduleMemoryRefresh();
  schedulePersist();
  syncMessagesFromActiveChat();
  renderChat();
  renderThreads();
}

function renderLanguageGate() {
  const current = langMeta();
  document.documentElement.lang = current.code;
  document.documentElement.dir = current.dir;
  els.languageTitle.textContent = t("gateTitle");
  els.languageHint.textContent = t("gateHint");
  els.languageSelectLabel.textContent = t("languagePill");
  els.languageContinueBtn.textContent = getContinueLabel();
  els.languageCurrent.innerHTML = `
    <article class="language-current__card">
      <span class="language-current__flag">${current.flag}</span>
      <div class="language-current__copy">
        <strong>${escapeHtml(current.label)}</strong>
        <span>${escapeHtml(current.name)}</span>
      </div>
      <span class="language-current__badge">${escapeHtml(t("languagePill"))}</span>
    </article>
  `;
  els.languageSelect.innerHTML = LANGUAGES.map((item) => `
    <option value="${item.code}" ${item.code === current.code ? "selected" : ""}>
      ${item.flag} ${item.label} (${item.name})
    </option>
  `).join("");
  els.languageCloseBtn.style.display = state.languageConfirmed ? "inline-flex" : "none";
  els.languageGate.style.display = state.languageGateOpen ? "grid" : "none";
}

function previewLanguageSelection(languageCode) {
  state.language = LANGUAGES.some((item) => item.code === languageCode) ? languageCode : "es";
  document.documentElement.lang = state.language;
  document.documentElement.dir = langMeta().dir;
  state.quickSuggestion = buildQuickSuggestion();
  renderAll();
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
}

function confirmLanguageSelection() {
  state.languageConfirmed = true;
  state.languageGateOpen = false;
  state.confirmedLanguage = state.language;
  localStorage.setItem(LOCAL_LANGUAGE_KEY, state.language);
  localStorage.setItem(LOCAL_LANGUAGE_CONFIRMED_KEY, "1");
  schedulePersist();
  renderAll();
  refreshContext().catch((error) => console.error(error));
}

function getContinueLabel() {
  const labels = {
    es: "Continuar",
    en: "Continue",
    fr: "Continuer",
    pt: "Continuar",
    ja: "続ける",
    ko: "계속",
    ar: "متابعة",
    zh: "继续",
    de: "Weiter",
  };
  return labels[state.language] || labels.en;
}

function getEmailDividerLabel() {
  const labels = {
    es: "o usa correo",
    en: "or use email",
    fr: "ou utilise l'email",
    pt: "ou use email",
    ja: "またはメールを使う",
    ko: "또는 이메일 사용",
    ar: "أو استخدم البريد",
    zh: "或使用邮箱",
    de: "oder E-Mail verwenden",
  };
  return labels[state.language] || labels.en;
}

function renderAuthGate() {
  els.authEyebrow.textContent = t("authEyebrow");
  els.authTitle.textContent = t("authTitle");
  els.authSubtitle.textContent = t("authSubtitle");
  els.authBullets.innerHTML = [
    ["authBullet1Title", "authBullet1Text"],
    ["authBullet2Title", "authBullet2Text"],
    ["authBullet3Title", "authBullet3Text"],
  ]
    .map(
      ([titleKey, textKey]) => `
        <article class="auth-bullet">
          <strong>${escapeHtml(t(titleKey))}</strong>
          <span>${escapeHtml(t(textKey))}</span>
        </article>
      `
    )
    .join("");

  els.authLoginModeBtn.textContent = t("authLogin");
  els.authSignupModeBtn.textContent = t("authSignup");
  els.authLoginModeBtn.classList.toggle("is-active", state.authMode === "login");
  els.authSignupModeBtn.classList.toggle("is-active", state.authMode === "signup");
  els.authNameField.style.display = state.authMode === "signup" ? "grid" : "none";
  els.authNameLabel.textContent = t("authName");
  els.authEmailLabel.textContent = t("authEmail");
  els.authPasswordLabel.textContent = t("authPassword");
  els.authSubmitBtn.textContent = state.authMode === "signup" ? t("authSubmitSignup") : t("authSubmitLogin");
  els.authSubmitBtn.disabled = state.isAuthSubmitting;
  els.authGoogleBtn.textContent = t("authGoogle");
  els.authGoogleBtn.disabled = state.isAuthSubmitting;
  els.authDivider.dataset.label = getEmailDividerLabel();
  els.authLegal.textContent = t("authLegal");

  els.authMessage.textContent = state.authMessage;
  els.authMessage.style.display = state.authMessage ? "block" : "none";
  els.authError.textContent = state.authError;
  els.authError.style.display = state.authError ? "block" : "none";

  const shouldShowAuth = state.authStatus !== "loading" && !state.user && state.languageConfirmed && !state.languageGateOpen;
  els.authGate.style.display = shouldShowAuth ? "grid" : "none";
}

function renderTravelModes() {
  els.travelModeGroup.innerHTML = Object.entries(t("travelModes"))
    .map(([mode, label]) => `
      <button class="mode-chip ${state.travelMode === mode ? "is-active" : ""}" type="button" data-mode="${mode}">
        ${escapeHtml(label)}
      </button>
    `)
    .join("");
}

function renderHero() {
  const lang = langMeta();
  els.brandTitle.textContent = t("brandTitle");
  els.brandSubtitle.textContent = t("brandSubtitle");
  els.accountPill.innerHTML = state.user
    ? `
        ${state.user.photoURL ? `<img class="account-pill__avatar" src="${escapeHtml(state.user.photoURL)}" alt="${escapeHtml(state.user.displayName || state.user.email || "Profile")}" />` : ""}
        <span>${escapeHtml(`${t("accountPrefix")}: ${state.user.displayName || state.user.email || "Traveler"}`)}</span>
      `
    : escapeHtml(t("loginRequired"));
  els.accountPill.classList.toggle("is-visible", Boolean(state.user));
  els.authLogoutBtn.textContent = t("logout");
  els.authLogoutBtn.style.display = state.user ? "inline-flex" : "none";
  els.changeLanguageBtn.textContent = `${lang.flag} ${t("changeLanguage")}`;
  els.locateBtn.textContent = t("locate");
  els.refreshBtn.textContent = t("refresh");
  els.heroEyebrow.textContent = `✦ ${t("heroEyebrow")}`;
  els.heroTitle.textContent = t("heroTitle");
  els.heroSubtitle.textContent = t("heroSubtitle");
  els.suggestionHeading.textContent = t("suggestionHeading");
  els.suggestionText.textContent = state.quickSuggestion || t("fallbackGreeting");
  els.assistantPreviewHeading.textContent = t("assistantPreviewHeading");
  els.assistantPreviewText.textContent = t("assistantPreviewText");
  els.keysHeading.textContent = t("keysHeading");
  els.keysText.textContent = t("keysText");
  els.locationPill.textContent = `${t("languagePill")}: ${lang.flag} ${lang.label}`;
  els.weatherPill.textContent = `${t("weatherPill")}: ${
    state.weather
      ? `${weatherLabel(state.weather.current_weather.weathercode)} ${formatTemperature(
          state.weather.current_weather.temperature
        )}`
      : t("weatherLoading")
  }`;
  els.planPill.textContent = `${t("planPill")}: ${state.plan.length} ${t("planCount")}`;
}

function renderSummaryCards() {
  els.locationCardLabel.textContent = t("locationCardLabel");
  els.weatherCardLabel.textContent = t("weatherCardLabel");
  els.timingCardLabel.textContent = t("timingCardLabel");
  els.locationCardValue.textContent = state.location?.displayName || t("locationLoading");
  els.locationCardHint.textContent = state.location?.reference
    ? t("useFallbackLocation")
    : state.location?.coords
      ? `${state.location.coords.lat.toFixed(4)}, ${state.location.coords.lng.toFixed(4)}`
      : t("locationLoading");
  els.weatherCardValue.textContent = state.weather
    ? `${weatherLabel(state.weather.current_weather.weathercode)} · ${formatTemperature(
        state.weather.current_weather.temperature
      )}`
    : t("weatherLoading");
  els.weatherCardHint.textContent = state.weather ? buildWeatherMood() : t("weatherLoading");
  els.timingCardValue.textContent = formatDateTime();
  els.timingCardHint.textContent = state.plan.length > 0
    ? `${state.plan.length} ${t("planCount")}`
    : t("starterQuestion");
}

function renderNearby() {
  els.nearbyTitle.textContent = t("nearbyTitle");
  els.nearbySubtitle.textContent = t("nearbySubtitle");

  if (!state.nearbyPlaces.length) {
    els.nearbyGrid.innerHTML = `<div class="empty-state">${escapeHtml(
      isConfigured(GOOGLE_API_KEY) ? t("emptyNearby") : t("mapsMissing")
    )}</div>`;
    return;
  }

  els.nearbyGrid.innerHTML = state.nearbyPlaces
    .map((place) => {
      const rating = Number.isFinite(place.rating) ? `★ ${place.rating.toFixed(1)}` : null;
      const hours = place.openNow === null
        ? t("unknownHours")
        : place.openNow
          ? t("openNow")
          : t("closedNow");

      return `
        <article class="place-card">
          <div class="place-card__media">
            ${place.photo ? `<img src="${escapeHtml(place.photo)}" alt="${escapeHtml(place.name)}" />` : ""}
            <div class="place-card__badge">${escapeHtml(
              t("placeTypes")[place.category] || place.category
            )}</div>
          </div>
          <div class="place-card__body">
            <h3>${escapeHtml(place.name)}</h3>
            <div class="place-card__meta">
              ${rating ? `<span class="mini-tag">${escapeHtml(rating)}</span>` : ""}
              <span class="mini-tag">${escapeHtml(hours)}</span>
              <span class="mini-tag">${escapeHtml(formatPriceLevel(place.priceLevel))}</span>
            </div>
            <p>${escapeHtml(place.address || place.editorialSummary || "")}</p>
            <div class="card-actions">
              <button class="action-button action-button--primary" type="button" data-save-place="${place.id}">${escapeHtml(t("addPlan"))}</button>
              <button class="action-button" type="button" data-route-place="${place.id}">${escapeHtml(t("routeTo"))}</button>
              <button class="action-button" type="button" data-ask-place="${place.id}">${escapeHtml(t("askAI"))}</button>
              ${place.mapsUrl ? `<button class="action-button" type="button" data-open-place="${place.id}">${escapeHtml(t("openMaps"))}</button>` : ""}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPlan() {
  els.planTitle.textContent = t("planTitle");
  els.planSubtitle.textContent = t("planSubtitle");

  if (!state.plan.length) {
    els.planGrid.innerHTML = `<div class="empty-state">${escapeHtml(t("emptyPlan"))}</div>`;
    return;
  }

  els.planGrid.innerHTML = state.plan
    .map((place) => `
      <article class="plan-card">
        <div class="plan-card__body">
          <h3 class="plan-card__title">${escapeHtml(place.name)}</h3>
          <div class="plan-card__meta">
            <span class="mini-tag">${escapeHtml(t("placeTypes")[place.category] || place.category)}</span>
            <span class="mini-tag">${escapeHtml(place.routeSummary || t("routeNone"))}</span>
          </div>
          <p>${escapeHtml(place.address || "")}</p>
          <div class="card-actions">
            <button class="action-button action-button--primary" type="button" data-route-place="${place.id}">${escapeHtml(t("routeTo"))}</button>
            <button class="action-button" type="button" data-remove-plan="${place.id}">${escapeHtml(t("removePlan"))}</button>
            ${place.mapsUrl ? `<button class="action-button" type="button" data-open-place="${place.id}">${escapeHtml(t("openMaps"))}</button>` : ""}
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderAssistant() {
  els.assistantTitle.textContent = t("assistantTitle");
  els.assistantSubtitle.textContent = t("assistantSubtitle");
  els.chatsHeading.textContent = t("chatsHeading");
  els.chatsHint.textContent = t("chatsHint");
  els.newChatBtn.textContent = t("newChat");
  els.connectBtn.textContent = t("connect");
  els.disconnectBtn.textContent = t("disconnect");
  els.contextBtn.textContent = t("refreshContext");
  els.micBtn.textContent = state.realtime.micEnabled ? t("micOn") : t("micOff");
  els.voiceBtn.textContent = state.realtime.voiceEnabled ? t("voiceOn") : t("voiceOff");
  els.connectionStatus.classList.toggle("is-live", state.realtime.connected);
  els.connectionStatusText.textContent = state.realtime.connected ? t("online") : t("offline");
  els.locationStatusText.textContent = state.location ? t("locating") : t("locatingBusy");
  els.assistantNotice.textContent = !state.user
    ? t("loginRequired")
    : hasRealtimeAuth()
      ? `${t("assistantNotice")} ${t("savedLabel")}.`
      : t("openaiMissing");
  els.chatInput.placeholder = t("placeholder");
  els.sendBtn.textContent = t("send");
  els.disconnectBtn.disabled = !state.realtime.connected && !state.realtime.connecting;
  els.connectBtn.disabled = !state.user || state.realtime.connected || state.realtime.connecting;
  els.contextBtn.disabled = !state.user || !state.realtime.connected;
  els.chatInput.disabled = !state.user;
  els.sendBtn.disabled = !state.user;
  els.newChatBtn.disabled = !state.user;
  els.quickPrompts.innerHTML = [t("quick1"), t("quick2"), t("quick3"), t("quick4")]
    .map((prompt) => `<button class="tiny-button" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
    .join("");
  els.helperRow.innerHTML = `
    <button class="tiny-button" type="button" data-helper="plan">${escapeHtml(t("quick1"))}</button>
    <button class="tiny-button" type="button" data-helper="weather">${escapeHtml(t("weatherAdvice"))}</button>
  `;
}

function renderThreads() {
  if (!state.chats.length) {
    els.threadList.innerHTML = `<div class="empty-state">${escapeHtml(t("emptyChats"))}</div>`;
    return;
  }

  els.threadList.innerHTML = state.chats
    .map((chat) => {
      const lastMessage = chat.messages.at(-1);
      const preview = lastMessage?.text || t("threadFresh");
      const meta = chat.id === state.activeChatId ? t("threadNow") : formatDateTime(new Date(chat.updatedAt));

      return `
        <button class="thread-item ${chat.id === state.activeChatId ? "is-active" : ""}" type="button" data-chat-id="${chat.id}">
          <span class="thread-item__title">${escapeHtml(chat.title)}</span>
          <span class="thread-item__meta">${escapeHtml(meta)}</span>
          <span class="thread-item__preview">${escapeHtml(preview.slice(0, 84))}</span>
        </button>
      `;
    })
    .join("");
}

function renderChat() {
  if (!state.messages.length) {
    els.chatLog.innerHTML = `<div class="empty-state">${escapeHtml(
      !state.user
        ? t("loginRequired")
        : state.realtime.connected
          ? t("starterQuestion")
          : t("assistantNotice")
    )}</div>`;
    return;
  }

  els.chatLog.innerHTML = state.messages
    .map(
      (message) => `
        <article class="chat-message chat-message--${message.role}">
          <span class="chat-message__meta">${message.role === "assistant" ? "AI" : escapeHtml(t("youLabel"))}</span>
          ${escapeHtml(message.text)}
        </article>
      `
    )
    .join("");
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function renderMap() {
  els.mapTitle.textContent = t("mapTitle");
  els.mapSubtitle.textContent = t("mapSubtitle");
  if (!isConfigured(GOOGLE_API_KEY)) {
    els.mapCanvas.className = "map-empty";
    els.mapCanvas.textContent = t("mapsMissing");
    return;
  }
  if (!state.maps.ready || !state.maps.map) {
    els.mapCanvas.className = "map-empty";
    els.mapCanvas.textContent = t("locationLoading");
  }
}

function renderAll() {
  renderLanguageGate();
  renderAuthGate();
  renderHero();
  renderSummaryCards();
  renderTravelModes();
  renderMap();
  renderNearby();
  renderPlan();
  renderAssistant();
  renderThreads();
  renderChat();
}

function normalizePlace(place, category) {
  const openNow = place.opening_hours?.isOpen?.() ?? place.opening_hours?.open_now ?? null;
  const lat = typeof place.geometry?.location?.lat === "function"
    ? place.geometry.location.lat()
    : place.geometry?.location?.lat;
  const lng = typeof place.geometry?.location?.lng === "function"
    ? place.geometry.location.lng()
    : place.geometry?.location?.lng;
  const photo = place.photos?.[0]?.getUrl
    ? place.photos[0].getUrl({ maxWidth: 900, maxHeight: 600 })
    : "";

  return {
    id: place.place_id,
    name: place.name || "Place",
    address: place.formatted_address || place.vicinity || "",
    location: lat && lng ? { lat, lng } : null,
    rating: place.rating || null,
    userRatingsTotal: place.user_ratings_total || null,
    priceLevel: place.price_level ?? null,
    openNow,
    mapsUrl: place.url || "",
    website: place.website || "",
    phone: place.international_phone_number || "",
    category,
    photo,
    openingHours: place.opening_hours?.weekday_text || [],
    editorialSummary: place.editorial_summary?.overview || "",
  };
}

async function loadGoogleMaps() {
  if (state.maps.ready || state.maps.loading || !isConfigured(GOOGLE_API_KEY)) {
    return;
  }

  state.maps.loading = true;
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_API_KEY
    )}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  state.maps.ready = true;
  state.maps.map = new google.maps.Map(els.mapCanvas, {
    center: DEFAULT_COORDS,
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  });
  state.maps.geocoder = new google.maps.Geocoder();
  state.maps.directionsService = new google.maps.DirectionsService();
  state.maps.directionsRenderer = new google.maps.DirectionsRenderer({
    map: state.maps.map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: "#8fd4ff",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    },
  });
  state.maps.placesService = new google.maps.places.PlacesService(state.maps.map);
}

async function detectLocation() {
  const position = await new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: {
          latitude: DEFAULT_COORDS.lat,
          longitude: DEFAULT_COORDS.lng,
        },
        reference: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () =>
        resolve({
          coords: {
            latitude: DEFAULT_COORDS.lat,
            longitude: DEFAULT_COORDS.lng,
          },
          reference: true,
        }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });

  state.location = {
    coords: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    },
    displayName: DEFAULT_COORDS.name,
    reference: Boolean(position.reference),
  };
}

async function reverseGeocode() {
  if (!state.maps.ready || !state.maps.geocoder || !state.location?.coords) {
    return;
  }

  const result = await state.maps.geocoder
    .geocode({ location: state.location.coords })
    .then((response) => response.results?.[0] || null)
    .catch(() => null);

  if (result) {
    state.location.displayName = result.formatted_address;
  }
}

async function fetchWeather() {
  if (!state.location?.coords) {
    return;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", state.location.coords.lat);
  url.searchParams.set("longitude", state.location.coords.lng);
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Weather fetch failed");
  }

  state.weather = await response.json();
}

function nearbySearch(request) {
  return new Promise((resolve) => {
    state.maps.placesService.nearbySearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
        resolve([]);
        return;
      }
      resolve(results);
    });
  });
}

function placeDetails(placeId) {
  return new Promise((resolve) => {
    state.maps.placesService.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "user_ratings_total",
          "price_level",
          "opening_hours",
          "url",
          "website",
          "international_phone_number",
          "photos",
          "editorial_summary",
        ],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          resolve(null);
          return;
        }
        resolve(place);
      }
    );
  });
}

async function loadNearbyPlaces() {
  if (!state.maps.ready || !state.maps.placesService || !state.location?.coords) {
    return;
  }

  const origin = new google.maps.LatLng(state.location.coords.lat, state.location.coords.lng);
  const batches = await Promise.all(
    TRAVEL_CATEGORIES.map((category) =>
      nearbySearch({
        location: origin,
        radius: 3200,
        type: category,
      }).then((results) =>
        Promise.all(
          results.slice(0, 3).map(async (place) => {
            const detail = await placeDetails(place.place_id);
            return detail ? normalizePlace(detail, category) : null;
          })
        )
      )
    )
  );

  const seen = new Set();
  state.nearbyPlaces = batches
    .flat()
    .filter(Boolean)
    .filter((place) => {
      if (seen.has(place.id)) {
        return false;
      }
      seen.add(place.id);
      return true;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);
}

function clearMarkers() {
  state.maps.markers.forEach((marker) => marker.setMap(null));
  state.maps.markers = [];
}

function renderMarkers() {
  if (!state.maps.map || !state.location?.coords) {
    return;
  }

  clearMarkers();

  const bounds = new google.maps.LatLngBounds();
  const userMarker = new google.maps.Marker({
    map: state.maps.map,
    position: state.location.coords,
    title: "You",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#8fd4ff",
      fillOpacity: 1,
      scale: 8,
      strokeColor: "#06101c",
      strokeWeight: 3,
    },
  });
  state.maps.markers.push(userMarker);
  bounds.extend(state.location.coords);

  state.nearbyPlaces.forEach((place) => {
    if (!place.location) {
      return;
    }
    const marker = new google.maps.Marker({
      map: state.maps.map,
      position: place.location,
      title: place.name,
    });
    marker.addListener("click", () => {
      state.selectedPlaceId = place.id;
      calculateRoute(place.id).catch(() => {});
    });
    state.maps.markers.push(marker);
    bounds.extend(place.location);
  });

  state.maps.map.fitBounds(bounds);
}

function addRouteSummaryToPlan(placeId, summary) {
  state.plan = state.plan.map((item) =>
    item.id === placeId ? { ...item, routeSummary: summary } : item
  );
  savePlan();
  schedulePersist();
  renderPlan();
}

async function calculateRoute(placeId) {
  const place = findPlace(placeId);
  if (!place || !place.location || !state.maps.directionsService || !state.location?.coords) {
    return null;
  }

  addRouteSummaryToPlan(placeId, t("routeBusy"));

  const result = await state.maps.directionsService.route({
    origin: state.location.coords,
    destination: place.location,
    travelMode: google.maps.TravelMode[state.travelMode],
  });

  state.maps.directionsRenderer.setDirections(result);
  const leg = result.routes?.[0]?.legs?.[0];
  if (!leg) {
    addRouteSummaryToPlan(placeId, t("noRoute"));
    return null;
  }

  const summary = `${leg.duration?.text || ""} · ${leg.distance?.text || ""}`.trim();
  addRouteSummaryToPlan(placeId, summary);
  return {
    duration: leg.duration?.text || "",
    distance: leg.distance?.text || "",
    startAddress: leg.start_address || "",
    endAddress: leg.end_address || "",
  };
}

function addPlaceToPlan(placeId) {
  const place = findPlace(placeId);
  if (!place || state.plan.some((item) => item.id === place.id)) {
    return;
  }
  state.plan = [...state.plan, { ...place, routeSummary: t("routeNone") }];
  savePlan();
  scheduleMemoryRefresh();
  schedulePersist();
  renderPlan();
  renderHero();
}

function removePlaceFromPlan(placeId) {
  state.plan = state.plan.filter((place) => place.id !== placeId);
  savePlan();
  scheduleMemoryRefresh();
  schedulePersist();
  renderPlan();
  renderHero();
}

function buildRealtimeInstructions() {
  const language = langMeta().label;
  const locationName = state.location?.displayName || DEFAULT_COORDS.name;
  const weather = state.weather
    ? `${weatherLabel(state.weather.current_weather.weathercode)}, ${formatTemperature(
        state.weather.current_weather.temperature
      )}`
    : "Unavailable";
  const nearby = state.nearbyPlaces
    .slice(0, 6)
    .map(
      (place, index) =>
        `${index + 1}. ${place.name} | ${t("placeTypes")[place.category] || place.category} | ${
          place.address || ""
        } | ${place.openNow === null ? t("unknownHours") : place.openNow ? t("openNow") : t("closedNow")} | ${
          Number.isFinite(place.rating) ? `rating ${place.rating}` : "rating n/a"
        } | ${formatPriceLevel(place.priceLevel)}`
    )
    .join("\n");
  const plan = state.plan.map((place, index) => `${index + 1}. ${place.name} | ${place.routeSummary || ""}`).join("\n");
  const transcript = getRecentTranscript();

  return `
You are a warm, proactive tourism concierge for travelers.
Always reply in ${language}.
Be concise, useful, and practical.
Use the available tools whenever live data would improve the answer.
When suggesting plans, be specific about timing, order, weather fit, and route convenience.
You can ask short follow-up questions to learn the traveler's style, budget, pace, companions, or food interests.
Do not invent exact prices or schedules if the live context does not include them.
Remember stable traveler preferences across turns and use them proactively when helpful.

Current travel context:
- Language: ${language}
- Current location: ${locationName}
- Current weather: ${weather}
- Travel mode preference: ${state.travelMode}
- Traveler memory: ${state.memorySummary}

Nearby places:
${nearby || "No live nearby places loaded yet."}

Traveler plan:
${plan || "No saved activities yet."}

Recent active chat:
${transcript || "No previous messages in this chat yet."}
  `.trim();
}

function buildRealtimeTools() {
  return [
    {
      type: "function",
      name: "get_live_context",
      description: "Get the latest location, weather, nearby places, and saved plan.",
      parameters: { type: "object", properties: {} },
    },
    {
      type: "function",
      name: "get_nearby_places",
      description: "List nearby places already loaded in the app, optionally filtered by category.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["tourist_attraction", "museum", "restaurant", "cafe"],
          },
        },
      },
    },
    {
      type: "function",
      name: "get_route_to_place",
      description: "Calculate route info from the traveler location to a known place.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
        },
        required: ["place_id"],
      },
    },
    {
      type: "function",
      name: "save_activity_to_plan",
      description: "Save a known nearby place into the traveler plan.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
        },
        required: ["place_id"],
      },
    },
    {
      type: "function",
      name: "remove_activity_from_plan",
      description: "Remove an activity from the traveler plan.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
        },
        required: ["place_id"],
      },
    },
    {
      type: "function",
      name: "list_saved_plan",
      description: "Return all currently saved activities in the traveler plan.",
      parameters: { type: "object", properties: {} },
    },
  ];
}

function sendRealtimeEvent(event) {
  if (!state.realtime.dc || state.realtime.dc.readyState !== "open") {
    return;
  }
  state.realtime.dc.send(JSON.stringify(event));
}

function updateRealtimeSession() {
  sendRealtimeEvent({
    type: "session.update",
    session: {
      type: "realtime",
      model: "gpt-realtime",
      output_modalities: state.realtime.voiceEnabled ? ["audio", "text"] : ["text"],
      audio: {
        output: {
          voice: "marin",
        },
        input: {
          turn_detection: {
            type: "semantic_vad",
          },
        },
      },
      instructions: buildRealtimeInstructions(),
      tools: buildRealtimeTools(),
      tool_choice: "auto",
    },
  });
}

function createAssistantMessage(responseId) {
  const messageId = `assistant-${responseId}`;
  state.realtime.bufferByResponse[responseId] = { messageId, text: "" };
  pushMessage("assistant", "", messageId);
}

function appendAssistantDelta(responseId, delta) {
  if (!delta) {
    return;
  }
  if (!state.realtime.bufferByResponse[responseId]) {
    createAssistantMessage(responseId);
  }
  const entry = state.realtime.bufferByResponse[responseId];
  entry.text += delta;
  updateMessage(entry.messageId, entry.text);
}

function extractTextFromResponse(response) {
  const parts = [];
  for (const item of response.output || []) {
    if (!item.content) {
      continue;
    }
    for (const content of item.content) {
      if (content.text) {
        parts.push(content.text);
      }
      if (content.transcript) {
        parts.push(content.transcript);
      }
    }
  }
  return parts.join("\n").trim();
}

async function handleToolCall(outputItem) {
  const args = outputItem.arguments ? JSON.parse(outputItem.arguments) : {};
  let result;

  switch (outputItem.name) {
    case "get_live_context":
      result = {
        location: state.location,
        weather: state.weather?.current_weather || null,
        nearby_places: state.nearbyPlaces,
        saved_plan: state.plan,
      };
      break;
    case "get_nearby_places":
      result = {
        places: args.category
          ? state.nearbyPlaces.filter((place) => place.category === args.category)
          : state.nearbyPlaces,
      };
      break;
    case "get_route_to_place": {
      const route = await calculateRoute(args.place_id);
      result = route || { error: t("noRoute") };
      break;
    }
    case "save_activity_to_plan":
      addPlaceToPlan(args.place_id);
      result = { saved: Boolean(state.plan.find((item) => item.id === args.place_id)), plan: state.plan };
      break;
    case "remove_activity_from_plan":
      removePlaceFromPlan(args.place_id);
      result = { removed: !state.plan.find((item) => item.id === args.place_id), plan: state.plan };
      break;
    case "list_saved_plan":
      result = { plan: state.plan };
      break;
    default:
      result = { error: `Unknown tool: ${outputItem.name}` };
      break;
  }

  sendRealtimeEvent({
    type: "conversation.item.create",
    item: {
      type: "function_call_output",
      call_id: outputItem.call_id,
      output: JSON.stringify(result),
    },
  });
}

async function handleRealtimeEvent(raw) {
  const event = JSON.parse(raw.data);

  if (event.type === "response.created") {
    state.realtime.activeResponseId = event.response.id;
    createAssistantMessage(event.response.id);
    return;
  }

  if (event.type === "response.output_text.delta") {
    appendAssistantDelta(event.response_id, event.delta);
    return;
  }

  if (event.type === "response.output_audio_transcript.delta") {
    appendAssistantDelta(event.response_id, event.delta);
    return;
  }

  if (event.type === "input_audio_buffer.speech_started") {
    els.locationStatusText.textContent = t("speechReady");
    return;
  }

  if (event.type === "input_audio_buffer.speech_stopped") {
    els.locationStatusText.textContent = state.realtime.micEnabled ? t("speechReady") : t("speechMuted");
    return;
  }

  if (event.type === "response.done") {
    const responseId = event.response.id;
    const output = event.response.output || [];
    const toolCalls = output.filter((item) => item.type === "function_call");

    if (toolCalls.length) {
      const buffer = state.realtime.bufferByResponse[responseId];
      if (buffer && !buffer.text.trim()) {
        removeMessage(buffer.messageId);
      }
      delete state.realtime.bufferByResponse[responseId];
      for (const call of toolCalls) {
        await handleToolCall(call);
      }
      sendRealtimeEvent({ type: "response.create" });
      return;
    }

    const finalText = extractTextFromResponse(event.response);
    const buffer = state.realtime.bufferByResponse[responseId];
    if (buffer) {
      if (finalText) {
        updateMessage(buffer.messageId, finalText);
      } else if (!buffer.text.trim()) {
        removeMessage(buffer.messageId);
      }
      delete state.realtime.bufferByResponse[responseId];
    } else if (finalText) {
      pushMessage("assistant", finalText);
    }
  }
}

async function getRealtimeToken() {
  if (OPENAI_TOKEN_ENDPOINT) {
    const response = await fetch(OPENAI_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-realtime",
        voice: "marin",
      }),
    });

    if (!response.ok) {
      throw new Error(`Realtime token endpoint failed with ${response.status}`);
    }

    const data = await response.json();
    return data.client_secret?.value || data.value || data.client_secret;
  }

  if (!isConfigured(OPENAI_API_KEY)) {
    throw new Error(t("openaiMissing"));
  }

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-realtime",
        audio: {
          output: {
            voice: "marin",
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create realtime token");
  }

  const data = await response.json();
  return data.client_secret?.value || data.value || data.client_secret;
}

async function connectRealtime() {
  if (!state.user || state.realtime.connected || state.realtime.connecting) {
    return;
  }

  state.realtime.connecting = true;
  renderAssistant();

  try {
    const token = await getRealtimeToken();
    const pc = new RTCPeerConnection();
    state.realtime.pc = pc;

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        els.remoteAudio.srcObject = stream;
      }
    };

    const dataChannel = pc.createDataChannel("oai-events");
    state.realtime.dc = dataChannel;
    dataChannel.addEventListener("message", (event) => {
      handleRealtimeEvent(event).catch((error) => console.error(error));
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.realtime.stream = stream;
    stream.getTracks().forEach((track) => {
      track.enabled = state.realtime.micEnabled;
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const response = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    });

    const answer = {
      type: "answer",
      sdp: await response.text(),
    };
    await pc.setRemoteDescription(answer);

    await new Promise((resolve, reject) => {
      dataChannel.addEventListener("open", resolve, { once: true });
      dataChannel.addEventListener("error", reject, { once: true });
    });

    updateRealtimeSession();
    state.realtime.connected = true;
    if (!state.messages.length) {
      pushMessage("assistant", t("fallbackGreeting"));
    }
    renderAssistant();

    if (state.messages.length <= 1) {
      sendTextToAssistant(
        `${t("starterQuestion")} ${
          state.location?.displayName ? `Current location: ${state.location.displayName}. ` : ""
        }${
          state.weather
            ? `Weather: ${weatherLabel(state.weather.current_weather.weathercode)} ${formatTemperature(
                state.weather.current_weather.temperature
              )}.`
            : ""
        }`
      );
    }
  } catch (error) {
    console.error(error);
    pushMessage("assistant", `${t("openaiMissing")}\n${error.message || ""}`.trim());
    disconnectRealtime();
  } finally {
    state.realtime.connecting = false;
    renderAssistant();
  }
}

function disconnectRealtime() {
  const { micEnabled, voiceEnabled } = state.realtime;

  if (state.realtime.stream) {
    state.realtime.stream.getTracks().forEach((track) => track.stop());
  }
  if (state.realtime.dc) {
    state.realtime.dc.close();
  }
  if (state.realtime.pc) {
    state.realtime.pc.close();
  }

  state.realtime = {
    pc: null,
    dc: null,
    stream: null,
    connected: false,
    connecting: false,
    micEnabled,
    voiceEnabled,
    activeResponseId: null,
    bufferByResponse: {},
  };

  els.remoteAudio.srcObject = null;
  renderAssistant();
}

function toggleMicrophone() {
  state.realtime.micEnabled = !state.realtime.micEnabled;
  if (state.realtime.stream) {
    state.realtime.stream.getAudioTracks().forEach((track) => {
      track.enabled = state.realtime.micEnabled;
    });
  }
  schedulePersist();
  renderAssistant();
}

function toggleVoice() {
  state.realtime.voiceEnabled = !state.realtime.voiceEnabled;
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
  schedulePersist();
  renderAssistant();
}

function sendTextToAssistant(text) {
  if (!state.user) {
    return;
  }

  const clean = String(text || "").trim();
  if (!clean) {
    return;
  }

  pushMessage("user", clean);
  sendRealtimeEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: clean,
        },
      ],
    },
  });
  sendRealtimeEvent({
    type: "response.create",
    response: {
      output_modalities: state.realtime.voiceEnabled ? ["audio", "text"] : ["text"],
    },
  });
}

async function askPlace(placeId) {
  const place = findPlace(placeId);
  if (!place) {
    return;
  }

  if (!state.realtime.connected) {
    await connectRealtime();
  }

  sendTextToAssistant(
    `${t("askAI")}: ${place.name}. ${place.address || ""} ${
      place.openNow === null ? "" : place.openNow ? t("openNow") : t("closedNow")
    } ${formatPriceLevel(place.priceLevel)}`
  );
}

function openPlaceInMaps(placeId) {
  const place = findPlace(placeId);
  if (!place?.mapsUrl) {
    return;
  }
  window.open(place.mapsUrl, "_blank", "noopener,noreferrer");
}

function sanitizePlan(plan) {
  if (!Array.isArray(plan)) {
    return [];
  }

  return plan
    .filter((item) => item && typeof item === "object" && item.id && item.name)
    .map((item) => ({
      ...item,
      routeSummary: String(item.routeSummary || t("routeNone")),
    }));
}

function resetTravelerSession() {
  disconnectRealtime();
  state.user = null;
  state.authStatus = "unauthenticated";
  state.authMessage = "";
  state.authError = "";
  state.isAuthSubmitting = false;
  state.plan = [];
  state.memorySummary = DEFAULT_MEMORY_SUMMARY;
  state.travelMode = DEFAULT_SETTINGS.travelMode;
  state.confirmedLanguage = localStorage.getItem(LOCAL_LANGUAGE_KEY) || DEFAULT_SETTINGS.language;
  state.languageConfirmed =
    localStorage.getItem(LOCAL_LANGUAGE_CONFIRMED_KEY) === "1"
    || Boolean(localStorage.getItem(LOCAL_LANGUAGE_KEY));
  state.languageGateOpen = !state.languageConfirmed;
  state.realtime.micEnabled = DEFAULT_SETTINGS.micEnabled;
  state.realtime.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
  setChats([createChat()]);
  localStorage.removeItem(LOCAL_PLAN_KEY);
}

async function hydrateUserState(firebaseUser) {
  state.authStatus = "loading";
  state.authError = "";
  state.authMessage = "";
  renderAll();

  try {
    const snapshot = await get(ref(database, `users/${firebaseUser.uid}/visita`));
    const stored = snapshot.exists() ? snapshot.val() : {};

    state.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || stored.profile?.email || "",
      displayName: firebaseUser.displayName || stored.profile?.displayName || "",
      photoURL: firebaseUser.photoURL || stored.profile?.photoURL || "",
    };
    state.language = stored.settings?.language || localStorage.getItem(LOCAL_LANGUAGE_KEY) || state.language;
    state.confirmedLanguage = state.language;
    state.travelMode = stored.settings?.travelMode || DEFAULT_SETTINGS.travelMode;
    state.realtime.micEnabled = stored.settings?.micEnabled ?? DEFAULT_SETTINGS.micEnabled;
    state.realtime.voiceEnabled = stored.settings?.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
    state.plan = sanitizePlan(stored.plan ?? loadPlan());
    setChats(stored.chats, stored.activeChatId);
    state.memorySummary = String(stored.memorySummary || "").trim() || buildTravelerMemory();

    localStorage.setItem(LOCAL_LANGUAGE_KEY, state.language);
    savePlan();
    state.authStatus = "authenticated";
    schedulePersist();
  } catch (error) {
    console.error("Could not hydrate traveler state.", error);
    state.authStatus = "unauthenticated";
    state.authError = getAuthErrorMessage(error);
    state.user = null;
    setChats([createChat()]);
  }

  renderAll();
}

function getAuthErrorMessage(error) {
  const lang = state.language;
  const dict = {
    es: {
      default: "No fue posible completar el acceso.",
      invalid: "Correo o contrasena incorrectos.",
      email: "Ese correo ya existe.",
      weak: "La contrasena debe tener al menos 6 caracteres.",
      popup: "La ventana de Google se cerro antes de completar el acceso.",
      network: "No se pudo conectar. Revisa tu conexion.",
    },
    en: {
      default: "We could not complete sign-in.",
      invalid: "Incorrect email or password.",
      email: "That email is already in use.",
      weak: "Password must contain at least 6 characters.",
      popup: "The Google window was closed before sign-in finished.",
      network: "Connection failed. Check your network.",
    },
  };
  const messages = dict[lang] || dict.en;
  const code = error?.code || "";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(code)) {
    return messages.invalid;
  }
  if (code === "auth/email-already-in-use") {
    return messages.email;
  }
  if (code === "auth/weak-password") {
    return messages.weak;
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/popup-blocked") {
    return messages.popup;
  }
  if (code === "auth/network-request-failed") {
    return messages.network;
  }
  return messages.default;
}

async function handleAuthSubmit() {
  const email = els.authEmailInput.value.trim();
  const password = els.authPasswordInput.value.trim();
  const name = els.authNameInput.value.trim();

  if (!email || !password || (state.authMode === "signup" && !name)) {
    state.authError = getAuthErrorMessage({ code: "auth/invalid-credential" });
    renderAuthGate();
    return;
  }

  state.isAuthSubmitting = true;
  state.authError = "";
  state.authMessage = "";
  renderAuthGate();

  try {
    if (state.authMode === "signup") {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(credentials.user, { displayName: name });
      }
      state.authMessage = "";
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    els.authForm.reset();
  } catch (error) {
    state.authError = getAuthErrorMessage(error);
  } finally {
    state.isAuthSubmitting = false;
    renderAuthGate();
  }
}

async function handleGoogleAccess() {
  state.isAuthSubmitting = true;
  state.authError = "";
  state.authMessage = "";
  renderAuthGate();

  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    state.authError = getAuthErrorMessage(error);
  } finally {
    state.isAuthSubmitting = false;
    renderAuthGate();
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    state.authError = getAuthErrorMessage(error);
    renderAuthGate();
  }
}

function createNewChat() {
  const nextChat = createChat();
  state.chats = [nextChat, ...state.chats];
  state.activeChatId = nextChat.id;
  syncMessagesFromActiveChat();
  disconnectRealtime();
  schedulePersist();
  renderAll();
}

function switchChat(chatId) {
  if (!state.chats.some((chat) => chat.id === chatId)) {
    return;
  }
  state.activeChatId = chatId;
  syncMessagesFromActiveChat();
  disconnectRealtime();
  schedulePersist();
  renderThreads();
  renderChat();
}

async function refreshContext() {
  try {
    await loadGoogleMaps();
    await detectLocation();
    await reverseGeocode();
    await fetchWeather();
    if (state.maps.ready) {
      await loadNearbyPlaces();
      renderMarkers();
    }
  } catch (error) {
    console.error(error);
  }

  state.quickSuggestion = buildQuickSuggestion();
  renderAll();
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const chatButton = event.target.closest("[data-chat-id]");
    if (chatButton) {
      switchChat(chatButton.dataset.chatId);
      return;
    }

    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) {
      state.travelMode = modeButton.dataset.mode;
      schedulePersist();
      renderTravelModes();
      if (state.selectedPlaceId) {
        calculateRoute(state.selectedPlaceId).catch(() => {});
      }
      return;
    }

    const saveButton = event.target.closest("[data-save-place]");
    if (saveButton) {
      addPlaceToPlan(saveButton.dataset.savePlace);
      return;
    }

    const removeButton = event.target.closest("[data-remove-plan]");
    if (removeButton) {
      removePlaceFromPlan(removeButton.dataset.removePlan);
      return;
    }

    const routeButton = event.target.closest("[data-route-place]");
    if (routeButton) {
      state.selectedPlaceId = routeButton.dataset.routePlace;
      calculateRoute(routeButton.dataset.routePlace).catch(() => {});
      return;
    }

    const mapsButton = event.target.closest("[data-open-place]");
    if (mapsButton) {
      openPlaceInMaps(mapsButton.dataset.openPlace);
      return;
    }

    const askButton = event.target.closest("[data-ask-place]");
    if (askButton) {
      askPlace(askButton.dataset.askPlace).catch((error) => console.error(error));
      return;
    }

    const promptButton = event.target.closest("[data-prompt]");
    if (promptButton) {
      els.chatInput.value = promptButton.dataset.prompt;
      return;
    }

    const helperButton = event.target.closest("[data-helper]");
    if (helperButton) {
      els.chatInput.value = helperButton.dataset.helper === "plan" ? t("quick1") : t("quick2");
    }
  });

  els.changeLanguageBtn.addEventListener("click", () => {
    state.languageGateOpen = true;
    renderLanguageGate();
    els.languageSelect.value = state.language;
  });
  els.languageCloseBtn.addEventListener("click", () => {
    state.language = state.confirmedLanguage;
    document.documentElement.lang = state.language;
    document.documentElement.dir = langMeta().dir;
    state.languageGateOpen = false;
    renderAll();
  });
  els.languageSelect.addEventListener("change", () => {
    previewLanguageSelection(els.languageSelect.value);
  });
  els.languageContinueBtn.addEventListener("click", () => {
    confirmLanguageSelection();
  });
  els.authLoginModeBtn.addEventListener("click", () => {
    state.authMode = "login";
    state.authError = "";
    state.authMessage = "";
    renderAuthGate();
  });
  els.authSignupModeBtn.addEventListener("click", () => {
    state.authMode = "signup";
    state.authError = "";
    state.authMessage = "";
    renderAuthGate();
  });
  els.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuthSubmit().catch((error) => console.error(error));
  });
  els.authGoogleBtn.addEventListener("click", () => handleGoogleAccess().catch((error) => console.error(error)));
  els.authLogoutBtn.addEventListener("click", () => handleLogout().catch((error) => console.error(error)));
  els.locateBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.refreshBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.connectBtn.addEventListener("click", () => connectRealtime().catch((error) => console.error(error)));
  els.disconnectBtn.addEventListener("click", disconnectRealtime);
  els.contextBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.micBtn.addEventListener("click", toggleMicrophone);
  els.voiceBtn.addEventListener("click", toggleVoice);
  els.newChatBtn.addEventListener("click", createNewChat);
  els.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = els.chatInput.value.trim();
    if (!text || !state.user) {
      return;
    }
    if (!state.realtime.connected) {
      await connectRealtime();
    }
    sendTextToAssistant(text);
    els.chatInput.value = "";
  });
}

function boot() {
  setChats([createChat()]);
  bindEvents();
  renderAll();
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      resetTravelerSession();
      renderAll();
      return;
    }

    await hydrateUserState(firebaseUser);
  });
  refreshContext().catch((error) => console.error(error));
}

boot();
