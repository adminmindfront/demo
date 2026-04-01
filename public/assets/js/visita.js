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
const EXPERIENCE_VERSION = "20260401a";
const LOCAL_LANGUAGE_KEY = "travel-language";
const LOCAL_LANGUAGE_CONFIRMED_KEY = "travel-language-confirmed";
const LOCAL_PLAN_KEY = "travel-plan";
const LOCAL_GENERATED_PLAN_KEY = "travel-generated-plan";
const LOCAL_SAVED_PLANS_KEY = "travel-saved-plans";
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

const MICRO_UI = {
  es: {
    compactHeroTitle: "Planea tu visita con IA",
    suggestionButton: "Dame una sugerencia",
    suggestionHeadingCompact: "Sugerencia lista",
    menuTitle: "Tu cuenta",
    voiceStart: "Iniciar",
    voiceStop: "Parar",
    planCreateButton: "Crear plan",
    planBuilderTitle: "Arma tu plan del dia",
    planBuilderHint: "Ponle nombre, dia y hora de inicio para calcular tiempos, traslados y horarios reales.",
    planNameLabel: "Nombre del plan",
    planDateLabel: "Dia",
    planStartTimeLabel: "Hora de inicio",
    planNamePlaceholder: "Ej. Museos y cafe",
    planBuilderCancel: "Cancelar",
    planBuilderSubmit: "Crear plan",
    generatedPlanEmpty: "Cuando armes tu plan, aqui veras horarios, traslados y alertas de apertura.",
    generatedPlanOrigin: "Desde tu ubicacion actual",
    trafficLow: "Sin trafico relevante",
    trafficMedium: "Poco trafico",
    trafficHigh: "Mucho trafico",
    hoursOk: "Abierto para esta visita",
    hoursWarn: "Ojo con el horario",
    hoursClosed: "Cerrado en ese horario",
    hoursUnknown: "Horario por confirmar",
    suggestionPrompt:
      "Dame una sugerencia concreta con base en mi ubicacion, clima y lugares cercanos. Incluye 2 o 3 actividades reales y preguntame si quiero agregarlas a mi plan.",
    generatedPlanSummary: "Plan calculado",
    reorderHint: "Arrastra para ordenar",
  },
  en: {
    compactHeroTitle: "Plan your visit with AI",
    suggestionButton: "Give me a suggestion",
    suggestionHeadingCompact: "Ready suggestion",
    menuTitle: "Your account",
    voiceStart: "Start",
    voiceStop: "Stop",
    planCreateButton: "Create plan",
    planBuilderTitle: "Build your day plan",
    planBuilderHint: "Add a name, day, and start time so we can calculate timing, transfers, and opening hours.",
    planNameLabel: "Plan name",
    planDateLabel: "Day",
    planStartTimeLabel: "Start time",
    planNamePlaceholder: "Ex. Museums and coffee",
    planBuilderCancel: "Cancel",
    planBuilderSubmit: "Create plan",
    generatedPlanEmpty: "Once you build your plan, timings, transfers, and opening alerts will appear here.",
    generatedPlanOrigin: "From your current location",
    trafficLow: "No relevant traffic",
    trafficMedium: "Light traffic",
    trafficHigh: "Heavy traffic",
    hoursOk: "Open for this visit",
    hoursWarn: "Check the schedule",
    hoursClosed: "Closed at that time",
    hoursUnknown: "Hours still unknown",
    suggestionPrompt:
      "Give me a concrete suggestion based on my current location, weather, and nearby places. Include 2 or 3 real activities and ask whether I want to add them to my plan.",
    generatedPlanSummary: "Planned route",
    reorderHint: "Drag to reorder",
  },
};

const DEFAULT_SETTINGS = {
  language: localStorage.getItem(LOCAL_LANGUAGE_KEY) || "es",
  travelMode: "WALKING",
  micEnabled: true,
  voiceEnabled: true,
  assistantMode: "voice",
};

const NEARBY_FILTERS = [
  { id: "all", labels: { es: "Todo", en: "All" }, types: [] },
  { id: "food", labels: { es: "Comida", en: "Food" }, types: ["restaurant", "cafe", "bar", "bakery"] },
  { id: "hotels", labels: { es: "Hoteles", en: "Hotels" }, types: ["lodging"] },
  { id: "outdoor", labels: { es: "Aire libre", en: "Outdoor" }, types: ["park", "campground", "zoo"] },
  { id: "entertainment", labels: { es: "Entretenimiento", en: "Entertainment" }, types: ["movie_theater", "amusement_park", "aquarium", "night_club"] },
  { id: "museums", labels: { es: "Museos", en: "Museums" }, types: ["museum"] },
  { id: "culture", labels: { es: "Cultura", en: "Culture" }, types: ["tourist_attraction", "museum", "art_gallery"] },
  { id: "shopping", labels: { es: "Compras", en: "Shopping" }, types: ["shopping_mall", "store"] },
  { id: "nightlife", labels: { es: "Vida nocturna", en: "Nightlife" }, types: ["bar", "night_club"] },
  { id: "family", labels: { es: "Familiar", en: "Family" }, types: ["amusement_park", "aquarium", "zoo", "park"] },
];

const EXTRA_PLACE_TYPE_LABELS = {
  restaurant: { es: "Restaurante", en: "Restaurant" },
  cafe: { es: "Cafe", en: "Cafe" },
  bar: { es: "Bar", en: "Bar" },
  bakery: { es: "Panaderia", en: "Bakery" },
  lodging: { es: "Hotel", en: "Hotel" },
  park: { es: "Parque", en: "Park" },
  campground: { es: "Campamento", en: "Campground" },
  zoo: { es: "Zoologico", en: "Zoo" },
  movie_theater: { es: "Cine", en: "Cinema" },
  amusement_park: { es: "Parque tematico", en: "Theme park" },
  aquarium: { es: "Acuario", en: "Aquarium" },
  night_club: { es: "Antro", en: "Night club" },
  art_gallery: { es: "Galeria", en: "Art gallery" },
  shopping_mall: { es: "Centro comercial", en: "Mall" },
  store: { es: "Tienda", en: "Store" },
  tourist_attraction: { es: "Atraccion", en: "Attraction" },
  museum: { es: "Museo", en: "Museum" },
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
  nearbyFilter: "all",
  nearbyFilterLoaded: {},
  selectedPlaceId: null,
  quickSuggestion: "",
  suggestionVisible: false,
  contextUpdatedAt: 0,
  user: null,
  authStatus: "loading",
  authMode: "login",
  authMessage: "",
  authError: "",
  isAuthSubmitting: false,
  assistantMode: DEFAULT_SETTINGS.assistantMode,
  activeSection: "assistant",
  menuOpen: false,
  chatMenuOpen: false,
  planBuilderOpen: false,
  generatedPlan: loadGeneratedPlan(),
  savedPlans: loadSavedPlans(),
  planWorkspace: "draft",
  expandedSavedPlanId: null,
  planDragId: null,
  accordions: {
    overview: true,
    map: false,
    nearby: false,
    plan: false,
  },
  chats: [],
  activeChatId: null,
  memorySummary: DEFAULT_MEMORY_SUMMARY,
  maps: {
    ready: false,
    loading: false,
    map: null,
    serviceHost: null,
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
    assistantSpeaking: false,
    pendingVoiceResponseTimer: null,
    handledAudioItems: {},
    activeResponseId: null,
    bufferByResponse: {},
  },
  messages: [],
};

let persistTimer = null;
let memoryTimer = null;
let refreshContextPromise = null;
let contextRefreshInterval = null;

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
  weatherCompact: document.getElementById("weatherCompact"),
  languageQuickBtn: document.getElementById("languageQuickBtn"),
  menuToggleBtn: document.getElementById("menuToggleBtn"),
  menuDrawer: document.getElementById("menuDrawer"),
  menuBackdrop: document.getElementById("menuBackdrop"),
  menuCloseBtn: document.getElementById("menuCloseBtn"),
  assistantSectionBtn: document.getElementById("assistantSectionBtn"),
  mapSectionBtn: document.getElementById("mapSectionBtn"),
  nearbySectionBtn: document.getElementById("nearbySectionBtn"),
  planSectionBtn: document.getElementById("planSectionBtn"),
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
  heroSuggestionCard: document.getElementById("heroSuggestionCard"),
  acceptSuggestionBtn: document.getElementById("acceptSuggestionBtn"),
  rejectSuggestionBtn: document.getElementById("rejectSuggestionBtn"),
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
  overviewAccordion: document.getElementById("overviewAccordion"),
  overviewAccordionTitle: document.getElementById("overviewAccordionTitle"),
  overviewAccordionHint: document.getElementById("overviewAccordionHint"),
  overviewAccordionIcon: document.getElementById("overviewAccordionIcon"),
  mapAccordion: document.getElementById("mapAccordion"),
  mapAccordionTitle: document.getElementById("mapAccordionTitle"),
  mapAccordionHint: document.getElementById("mapAccordionHint"),
  mapAccordionIcon: document.getElementById("mapAccordionIcon"),
  mapTitle: document.getElementById("mapTitle"),
  mapSubtitle: document.getElementById("mapSubtitle"),
  travelModeGroup: document.getElementById("travelModeGroup"),
  mapCanvas: document.getElementById("mapCanvas"),
  nearbyAccordion: document.getElementById("nearbyAccordion"),
  nearbyAccordionTitle: document.getElementById("nearbyAccordionTitle"),
  nearbyAccordionHint: document.getElementById("nearbyAccordionHint"),
  nearbyAccordionIcon: document.getElementById("nearbyAccordionIcon"),
  nearbyTitle: document.getElementById("nearbyTitle"),
  nearbySubtitle: document.getElementById("nearbySubtitle"),
  nearbyFilterRow: document.getElementById("nearbyFilterRow"),
  nearbyGrid: document.getElementById("nearbyGrid"),
  planAccordion: document.getElementById("planAccordion"),
  planAccordionTitle: document.getElementById("planAccordionTitle"),
  planAccordionHint: document.getElementById("planAccordionHint"),
  planAccordionIcon: document.getElementById("planAccordionIcon"),
  planTitle: document.getElementById("planTitle"),
  planSubtitle: document.getElementById("planSubtitle"),
  draftPlanTabBtn: document.getElementById("draftPlanTabBtn"),
  savedPlansTabBtn: document.getElementById("savedPlansTabBtn"),
  draftPlanWorkspace: document.getElementById("draftPlanWorkspace"),
  savedPlansWorkspace: document.getElementById("savedPlansWorkspace"),
  planGrid: document.getElementById("planGrid"),
  openPlanBuilderBtn: document.getElementById("openPlanBuilderBtn"),
  generatedPlan: document.getElementById("generatedPlan"),
  savedPlansList: document.getElementById("savedPlansList"),
  assistantPanel: document.getElementById("assistantPanel"),
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
  assistantModeTabs: document.getElementById("assistantModeTabs"),
  chatMenu: document.getElementById("chatMenu"),
  chatMenuBtn: document.getElementById("chatMenuBtn"),
  chatMenuPanel: document.getElementById("chatMenuPanel"),
  chatMenuNewBtn: document.getElementById("chatMenuNewBtn"),
  voiceModeBtn: document.getElementById("voiceModeBtn"),
  textModeBtn: document.getElementById("textModeBtn"),
  assistantVoicePane: document.getElementById("assistantVoicePane"),
  assistantTextPane: document.getElementById("assistantTextPane"),
  voiceVisual: document.getElementById("voiceVisual"),
  voiceVisualizerTitle: document.getElementById("voiceVisualizerTitle"),
  voiceVisualizerHint: document.getElementById("voiceVisualizerHint"),
  voiceSessionBtn: document.getElementById("voiceSessionBtn"),
  threadList: document.getElementById("threadList"),
  quickPrompts: document.getElementById("quickPrompts"),
  chatLog: document.getElementById("chatLog"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),
  suggestionBtn: document.getElementById("suggestionBtn"),
  planBuilderSheet: document.getElementById("planBuilderSheet"),
  planBuilderTitle: document.getElementById("planBuilderTitle"),
  planBuilderHint: document.getElementById("planBuilderHint"),
  planBuilderCloseBtn: document.getElementById("planBuilderCloseBtn"),
  planBuilderForm: document.getElementById("planBuilderForm"),
  planNameLabel: document.getElementById("planNameLabel"),
  planNameInput: document.getElementById("planNameInput"),
  planDateLabel: document.getElementById("planDateLabel"),
  planDateInput: document.getElementById("planDateInput"),
  planStartTimeLabel: document.getElementById("planStartTimeLabel"),
  planStartTimeInput: document.getElementById("planStartTimeInput"),
  planTravelModeLabel: document.getElementById("planTravelModeLabel"),
  planTravelModeInput: document.getElementById("planTravelModeInput"),
  planBuilderCancelBtn: document.getElementById("planBuilderCancelBtn"),
  planBuilderSubmitBtn: document.getElementById("planBuilderSubmitBtn"),
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
  localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(cleanForStorage(state.plan)));
}

function loadSavedPlans() {
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedPlans() {
  localStorage.setItem(LOCAL_SAVED_PLANS_KEY, JSON.stringify(cleanForStorage(state.savedPlans)));
}

function loadGeneratedPlan() {
  try {
    const raw = localStorage.getItem(LOCAL_GENERATED_PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGeneratedPlan() {
  if (state.generatedPlan) {
    localStorage.setItem(LOCAL_GENERATED_PLAN_KEY, JSON.stringify(cleanForStorage(state.generatedPlan)));
    return;
  }
  localStorage.removeItem(LOCAL_GENERATED_PLAN_KEY);
}

function cleanForStorage(value) {
  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cleanForStorage(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cleanForStorage(item)])
    );
  }

  return String(value);
}

function t(key) {
  return EXTRA_UI[state.language]?.[key]
    || UI[state.language]?.[key]
    || EXTRA_UI.en[key]
    || UI.en?.[key]
    || key;
}

function micro(key) {
  return MICRO_UI[state.language]?.[key]
    || MICRO_UI.en[key]
    || key;
}

function localizedText(labels) {
  return labels[state.language] || labels.en || Object.values(labels)[0] || "";
}

function getCompactAuthTitle() {
  return localizedText({
    es: "Inicia sesion para continuar.",
    en: "Sign in to continue.",
    fr: "Connectez-vous pour continuer.",
    pt: "Entre para continuar.",
    ja: "ç¶šè¡Œã™ã‚‹ã«ã¯ãƒ­ã‚°ã‚¤ãƒ³ã—ã¦ãã ã•ã„ã€‚",
    ko: "ê³„ì†í•˜ë ¤ë©´ ë¡œê·¸ì¸í•˜ì„¸ìš”.",
    ar: "Ø³Ø¬Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©.",
    zh: "ç™»å½•åŽç»§ç»­ã€‚",
    de: "Melde dich an, um fortzufahren.",
  });
}

function getSuggestionLoadingText() {
  return localizedText({
    es: "Estoy preparando una sugerencia con tu ubicacion, clima y lugares cercanos...",
    en: "I am preparing a suggestion using your location, weather, and nearby places...",
    fr: "Je prepare une suggestion avec votre position, la meteo et les lieux proches...",
    pt: "Estou preparando uma sugestao com sua localizacao, clima e lugares proximos...",
    ja: "ä½ç½®ã€å¤©æ°—ã€è¿‘ãã®å ´æ‰€ã‚’ä½¿ã£ã¦ææ¡ˆã‚’æº–å‚™ã—ã¦ã„ã¾ã™...",
    ko: "ìœ„ì¹˜, ë‚ ì”¨, ê·¼ì²˜ ìž¥ì†Œë¥¼ ë°”íƒ•ìœ¼ë¡œ ì¶”ì²œì„ ì¤€ë¹„í•˜ê³  ìžˆìŠµë‹ˆë‹¤...",
    ar: "Ø£Ø¬Ù‡Ø² Ø§Ù‚ØªØ±Ø§Ø­Ù‹Ø§ Ø¨Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ù…ÙˆÙ‚Ø¹Ùƒ ÙˆØ§Ù„Ø·Ù‚Ø³ ÙˆØ§Ù„Ø£Ù…Ø§ÙƒÙ† Ø§Ù„Ù‚Ø±ÙŠØ¨Ø©...",
    zh: "æ­£åœ¨æ ¹æ®ä½ çš„ä½ç½®ã€å¤©æ°”å’Œé™„è¿‘åœ°ç‚¹å‡†å¤‡å»ºè®®...",
    de: "Ich bereite gerade einen Vorschlag mit deinem Standort, Wetter und Orten in der Naehe vor...",
  });
}

function getAcceptPlanLabel() {
  return localizedText({
    es: "Aceptar plan",
    en: "Accept plan",
    fr: "Accepter le plan",
    pt: "Aceitar plano",
    ja: "ã“ã®ãƒ—ãƒ©ãƒ³ã‚’æŽ¡ç”¨",
    ko: "í”Œëžœ ìˆ˜ë½",
    ar: "Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ø®Ø·Ø©",
    zh: "接受计划",
    de: "Plan annehmen",
  });
}

function getRejectPlanLabel() {
  return localizedText({
    es: "Rechazar plan",
    en: "Reject plan",
    fr: "Refuser le plan",
    pt: "Recusar plano",
    ja: "ãƒ—ãƒ©ãƒ³ã‚’è¦‹é€ã‚‹",
    ko: "í”Œëžœ ê±°ì ˆ",
    ar: "Ø±ÙØ¶ Ø§Ù„Ø®Ø·Ø©",
    zh: "拒绝计划",
    de: "Plan ablehnen",
  });
}

function getChatMenuLabel() {
  return localizedText({
    es: "Chats",
    en: "Chats",
    fr: "Chats",
    pt: "Chats",
    ja: "ãƒãƒ£ãƒƒãƒˆ",
    ko: "ì±„íŒ…",
    ar: "Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§Øª",
    zh: "聊天",
    de: "Chats",
  });
}

function getNewChatMenuLabel() {
  return localizedText({
    es: "Nuevo chat +",
    en: "New chat +",
    fr: "Nouveau chat +",
    pt: "Novo chat +",
    ja: "æ–°ã—ã„ãƒãƒ£ãƒƒãƒˆ +",
    ko: "ìƒˆ ì±„íŒ… +",
    ar: "Ù…Ø­Ø§Ø¯Ø«Ø© Ø¬Ø¯ÙŠØ¯Ø© +",
    zh: "新建聊天 +",
    de: "Neuer Chat +",
  });
}

function getDeleteChatLabel() {
  return localizedText({
    es: "Borrar chat",
    en: "Delete chat",
    fr: "Supprimer le chat",
    pt: "Excluir chat",
    ja: "ãƒãƒ£ãƒƒãƒˆã‚’å‰Šé™¤",
    ko: "ì±„íŒ… ì‚­ì œ",
    ar: "Ø­Ø°Ù Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©",
    zh: "删除聊天",
    de: "Chat loeschen",
  });
}

function getMessagePlaceholder() {
  return localizedText({
    es: "Escribe tu mensaje",
    en: "Write your message",
    fr: "Ecris ton message",
    pt: "Escreva sua mensagem",
    ja: "ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã‚’å…¥åŠ›",
    ko: "ë©”ì‹œì§€ë¥¼ ìž…ë ¥í•˜ì„¸ìš”",
    ar: "Ø§ÙƒØªØ¨ Ø±Ø³Ø§Ù„ØªÙƒ",
    zh: "输入你的消息",
    de: "Schreibe deine Nachricht",
  });
}

function getPlanTravelModeLabel() {
  return localizedText({
    es: "Modo de traslado",
    en: "Travel mode",
    fr: "Mode de transport",
    pt: "Modo de deslocamento",
    ja: "ç§»å‹•æ‰‹æ®µ",
    ko: "ì´ë™ ìˆ˜ë‹¨",
    ar: "ÙˆØ³ÙŠÙ„Ø© Ø§Ù„ØªÙ†Ù‚Ù„",
    zh: "出行方式",
    de: "Verkehrsart",
  });
}

function getDraftPlanLabel() {
  return localizedText({
    es: "Nuevo plan",
    en: "New plan",
    fr: "Nouveau plan",
    pt: "Novo plano",
    ja: "æ–°ã—ã„ãƒ—ãƒ©ãƒ³",
    ko: "ìƒˆ í”Œëžœ",
    ar: "Ø®Ø·Ø© Ø¬Ø¯ÙŠØ¯Ø©",
    zh: "新计划",
    de: "Neuer Plan",
  });
}

function getSavedPlansLabel() {
  return localizedText({
    es: "Mis planes",
    en: "My plans",
    fr: "Mes plans",
    pt: "Meus planos",
    ja: "ä¿å­˜ã—ãŸãƒ—ãƒ©ãƒ³",
    ko: "ë‚´ í”Œëžœ",
    ar: "Ø®Ø·Ø·ÙŠ",
    zh: "我的计划",
    de: "Meine Plaene",
  });
}

function getEditLabel() {
  return localizedText({
    es: "Editar",
    en: "Edit",
    fr: "Modifier",
    pt: "Editar",
    ja: "ç·¨é›†",
    ko: "íŽ¸ì§‘",
    ar: "ØªØ¹Ø¯ÙŠÙ„",
    zh: "编辑",
    de: "Bearbeiten",
  });
}

function getDeleteLabel() {
  return localizedText({
    es: "Eliminar",
    en: "Delete",
    fr: "Supprimer",
    pt: "Excluir",
    ja: "å‰Šé™¤",
    ko: "ì‚­ì œ",
    ar: "Ø­Ø°Ù",
    zh: "删除",
    de: "Loeschen",
  });
}

function getNearbyFilterLabel(filter) {
  return filter?.labels?.[state.language] || filter?.labels?.en || filter?.id || "";
}

function getPlaceTypeLabel(type) {
  return EXTRA_PLACE_TYPE_LABELS[type]?.[state.language]
    || EXTRA_PLACE_TYPE_LABELS[type]?.en
    || t("placeTypes")?.[type]
    || type;
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

function getMicFallbackMessage() {
  const labels = {
    es: "No detecte un microfono disponible. Seguimos en modo texto.",
    en: "No microphone was detected. We can continue in text mode.",
    fr: "Aucun micro disponible. Nous continuons en mode texte.",
    pt: "Nao detectei microfone disponivel. Seguimos em modo texto.",
    ja: "利用可能なマイクが見つかりません。テキストモードで続けます。",
    ko: "사용 가능한 마이크가 없습니다. 텍스트 모드로 계속합니다.",
    ar: "لم يتم العثور على ميكروفون متاح. سنكمل بالنص.",
    zh: "未检测到可用麦克风。我们将继续使用文字模式。",
    de: "Kein Mikrofon gefunden. Wir machen im Textmodus weiter.",
  };
  return labels[state.language] || labels.en;
}

function getRealtimeTimeoutMessage() {
  const labels = {
    es: "El servicio de voz tardo demasiado en responder. Intenta de nuevo en unos segundos.",
    en: "The realtime service took too long to respond. Please try again in a few seconds.",
    fr: "Le service temps reel a tarde trop longtemps. Reessaie dans quelques secondes.",
    pt: "O servico em tempo real demorou demais. Tente novamente em alguns segundos.",
    ja: "リアルタイム接続の応答に時間がかかりすぎました。数秒後に再試行してください。",
    ko: "실시간 서비스 응답이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.",
    ar: "استغرق الاتصال الفوري وقتا طويلا جدا. حاول مرة اخرى بعد بضع ثوان.",
    zh: "实时服务响应时间过长。请几秒后重试。",
    de: "Der Realtime-Dienst hat zu lange gebraucht. Bitte versuche es in ein paar Sekunden erneut.",
  };
  return labels[state.language] || labels.en;
}

function getRealtimeSdpErrorMessage(details = "") {
  const base = {
    es: "No se pudo abrir la sesion de voz en tiempo real.",
    en: "Could not open the realtime voice session.",
    fr: "Impossible d'ouvrir la session vocale temps reel.",
    pt: "Nao foi possivel abrir a sessao de voz em tempo real.",
    ja: "リアルタイム音声セッションを開始できませんでした。",
    ko: "실시간 음성 세션을 열 수 없습니다.",
    ar: "تعذر فتح جلسة الصوت الفوري.",
    zh: "无法打开实时语音会话。",
    de: "Die Realtime-Sprachsitzung konnte nicht gestartet werden.",
  };

  return `${base[state.language] || base.en}${details ? ` ${details}` : ""}`.trim();
}

function normalizeRealtimeError(error) {
  const message = String(error?.message || "");

  if (error?.name === "NotFoundError" || /Requested device not found/i.test(message)) {
    return getMicFallbackMessage();
  }

  if (error?.name === "AbortError" || /504/.test(message) || /timeout/i.test(message)) {
    return getRealtimeTimeoutMessage();
  }

  return message || t("openaiMissing");
}

async function getRealtimeAnswerSdp(offerSdp) {
  if (!OPENAI_TOKEN_ENDPOINT) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(OPENAI_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-realtime",
        voice: "marin",
        offerSdp,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || `Realtime signaling endpoint failed with ${response.status}`);
    }

    if (!data?.sdp) {
      throw new Error("Realtime signaling endpoint did not return SDP");
    }

    return data.sdp;
  } finally {
    clearTimeout(timeoutId);
  }
}

function weatherLabel(code) {
  const key = WEATHER_CODES[code] || "clear";
  return WEATHER_TEXT[state.language][key] || WEATHER_TEXT.en[key];
}

function formatTemperature(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  if (state.language === "en") {
    return `${Math.round((value * 9) / 5 + 32)}°F`;
  }

  return `${Math.round(value)}°C`;
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

function formatTimeOnly(date) {
  return new Intl.DateTimeFormat(state.language, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDayOnly(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value || "");
  }
  return new Intl.DateTimeFormat(state.language, {
    dateStyle: "full",
  }).format(date);
}

function weatherGlyph(code) {
  const family = WEATHER_CODES[code] || "clear";
  if (["rain", "drizzle", "showers"].includes(family)) return "🌧";
  if (family === "storm") return "⛈";
  if (family === "snow") return "❄";
  if (["cloudy", "partlyCloudy", "mostlyClear", "fog"].includes(family)) return "☁";
  return "☀";
}

function normalizeTextSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getTodayIso(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
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
  return cleanForStorage({
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
      assistantMode: state.assistantMode,
    },
    plan: state.plan,
    generatedPlan: state.generatedPlan,
    savedPlans: state.savedPlans,
    chats: state.chats,
    activeChatId: state.activeChatId,
    memorySummary: state.memorySummary,
  });
}

async function persistTravelerData() {
  if (!state.user?.uid) {
    savePlan();
    saveGeneratedPlan();
    saveSavedPlans();
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

function findPlaceByName(placeName) {
  const query = normalizeTextSearch(placeName);
  if (!query) {
    return null;
  }

  const pool = [...state.nearbyPlaces, ...state.plan];
  let bestPlace = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const place of pool) {
    const name = normalizeTextSearch(place?.name);
    if (!name) {
      continue;
    }

    let score = 0;
    if (name === query) score += 10;
    if (name.includes(query) || query.includes(name)) score += 6;
    if (normalizeTextSearch(place.address).includes(query)) score += 2;
    score += scorePlaceForMoment(place) * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestPlace = place;
    }
  }

  return bestScore >= 3 ? bestPlace : null;
}

function getNearbyFilterConfig(filterId = state.nearbyFilter) {
  return NEARBY_FILTERS.find((filter) => filter.id === filterId) || NEARBY_FILTERS[0];
}

function getFilteredNearbyPlaces(filterId = state.nearbyFilter) {
  const filter = getNearbyFilterConfig(filterId);
  if (!filter.types.length) {
    return state.nearbyPlaces;
  }

  return state.nearbyPlaces.filter((place) => filter.types.includes(place.category));
}

function sortSavedPlans(plans) {
  return [...plans].sort((a, b) => {
    const aDate = `${a.date || ""}T${a.startTime || "00:00"}:00`;
    const bDate = `${b.date || ""}T${b.startTime || "00:00"}:00`;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function computeDistanceMeters(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  const earthRadius = 6371000;
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(origin.lat))
      * Math.cos(toRadians(destination.lat))
      * Math.sin(dLng / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getWeatherStrategy() {
  const temperature = state.weather?.current_weather?.temperature;
  const code = state.weather?.current_weather?.weathercode;

  if (Number.isFinite(temperature) && temperature >= 32) {
    return "hot";
  }
  if (["rain", "drizzle", "showers", "storm"].includes(WEATHER_CODES[code])) {
    return "rainy";
  }
  return "pleasant";
}

function buildWeatherMood() {
  if (getWeatherStrategy() === "hot") {
    return t("weatherMoodHot");
  }
  if (getWeatherStrategy() === "rainy") {
    return t("weatherMoodRain");
  }
  return t("weatherMoodSunny");
}

function isIndoorPlace(place) {
  return ["museum", "restaurant", "cafe"].includes(place?.category);
}

function estimateVisitMinutes(place) {
  switch (place?.category) {
    case "museum":
      return 95;
    case "restaurant":
      return 80;
    case "cafe":
      return 45;
    case "tourist_attraction":
      return 75;
    default:
      return 60;
  }
}

function buildPlaceReason(place) {
  const reasons = [];
  const strategy = getWeatherStrategy();

  if (strategy === "rainy" && isIndoorPlace(place)) {
    reasons.push(t("weatherMoodRain"));
  } else if (strategy === "hot" && isIndoorPlace(place)) {
    reasons.push(t("weatherMoodHot"));
  } else if (strategy === "pleasant" && place.category === "tourist_attraction") {
    reasons.push(t("weatherMoodSunny"));
  }

  if (place.openNow === true) {
    reasons.push(t("openNow"));
  }
  if (place.distanceMeters) {
    reasons.push(formatDistance(place.distanceMeters));
  }

  return reasons.filter(Boolean).join(" · ");
}

function scorePlaceForMoment(place) {
  const strategy = getWeatherStrategy();
  let score = 0;

  if (strategy === "rainy") {
    score += isIndoorPlace(place) ? 6 : -3;
  } else if (strategy === "hot") {
    score += isIndoorPlace(place) ? 5 : -2;
  } else {
    score += place.category === "tourist_attraction" ? 4 : 1;
  }

  if (place.openNow === true) {
    score += 3;
  }
  if (place.openNow === false) {
    score -= 5;
  }
  if (Number.isFinite(place.rating)) {
    score += place.rating;
  }
  if (Number.isFinite(place.distanceMeters)) {
    score += Math.max(0, 3 - place.distanceMeters / 1000);
  }
  if (place.category === "restaurant" || place.category === "cafe") {
    score += 0.8;
  }

  return score;
}

function getRecommendedPlaces(limit = 3, source = state.nearbyPlaces) {
  return [...source]
    .filter((place) => place?.location)
    .sort((a, b) => scorePlaceForMoment(b) - scorePlaceForMoment(a))
    .slice(0, limit);
}

function buildQuickSuggestionLegacy() {
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

function buildQuickSuggestion() {
  const [first, second] = getRecommendedPlaces(2);
  const head = state.location?.displayName || DEFAULT_COORDS.name;
  const weather = state.weather
    ? `${weatherLabel(state.weather.current_weather.weathercode)} ${formatTemperature(
        state.weather.current_weather.temperature
      )}`
    : t("weatherLoading");
  const firstStop = first
    ? `${first.name}${first.distanceMeters ? ` (${formatDistance(first.distanceMeters)})` : ""}`
    : null;
  const secondStop = second
    ? `${second.name}${second.distanceMeters ? ` (${formatDistance(second.distanceMeters)})` : ""}`
    : null;

  switch (state.language) {
    case "en":
      return `You are near ${head}. Weather now: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `A strong first stop is ${firstStop}.` : "Start with something nearby."
      }${secondStop ? ` Then continue with ${secondStop}.` : ""}`;
    case "fr":
      return `Vous etes pres de ${head}. Meteo actuelle: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `Un bon premier arret est ${firstStop}.` : "Commencez par quelque chose de proche."
      }${secondStop ? ` Puis continuez avec ${secondStop}.` : ""}`;
    case "pt":
      return `Voce esta perto de ${head}. Clima agora: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `Uma boa primeira parada e ${firstStop}.` : "Comece por algo proximo."
      }${secondStop ? ` Depois siga para ${secondStop}.` : ""}`;
    case "ja":
      return `${head} の近くにいます。現在の天気は ${weather} です。${buildWeatherMood()} ${
        firstStop ? `まずは ${firstStop} から始めるのがよさそうです。` : "まずは近くから始めましょう。"
      }${secondStop ? ` その次は ${secondStop} が合いそうです。` : ""}`;
    case "ko":
      return `${head} 근처에 있습니다. 지금 날씨는 ${weather} 입니다. ${buildWeatherMood()} ${
        firstStop ? `첫 목적지는 ${firstStop} 이 좋겠습니다.` : "가까운 곳부터 시작해 보세요."
      }${secondStop ? ` 다음으로는 ${secondStop} 이 잘 맞습니다.` : ""}`;
    case "ar":
      return `أنت الآن بالقرب من ${head}. الطقس الحالي: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `بداية جيدة ستكون ${firstStop}.` : "ابدأ من مكان قريب."
      }${secondStop ? ` ثم انتقل إلى ${secondStop}.` : ""}`;
    case "zh":
      return `你现在位于 ${head} 附近。当前天气：${weather}。${buildWeatherMood()} ${
        firstStop ? `可以先去 ${firstStop}。` : "可以先从附近开始。"
      }${secondStop ? ` 然后再去 ${secondStop}。` : ""}`;
    case "de":
      return `Du bist in der Naehe von ${head}. Aktuelles Wetter: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `Ein guter erster Halt ist ${firstStop}.` : "Starte mit etwas in der Naehe."
      }${secondStop ? ` Danach passt ${secondStop}.` : ""}`;
    default:
      return `Estas cerca de ${head}. Clima actual: ${weather}. ${buildWeatherMood()} ${
        firstStop ? `Una buena primera parada es ${firstStop}.` : "Podrias empezar cerca de aqui."
      }${secondStop ? ` Despues sigue con ${secondStop}.` : ""}`;
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

function getAssistantModeLabel(mode) {
  const labels = {
    voice: {
      es: "Voz",
      en: "Voice",
      fr: "Voix",
      pt: "Voz",
      ja: "音声",
      ko: "음성",
      ar: "صوت",
      zh: "语音",
      de: "Stimme",
    },
    text: {
      es: "Texto",
      en: "Text",
      fr: "Texte",
      pt: "Texto",
      ja: "テキスト",
      ko: "텍스트",
      ar: "نص",
      zh: "文字",
      de: "Text",
    },
  };

  return labels[mode]?.[state.language] || labels[mode]?.en || mode;
}

function formatNearbyCount(count) {
  const labels = {
    es: count === 1 ? "lugar listo" : "lugares listos",
    en: count === 1 ? "place ready" : "places ready",
    fr: count === 1 ? "lieu pret" : "lieux prets",
    pt: count === 1 ? "lugar pronto" : "lugares prontos",
    ja: count === 1 ? "件の候補" : "件の候補",
    ko: count === 1 ? "개 추천" : "개 추천",
    ar: count === 1 ? "مكان جاهز" : "أماكن جاهزة",
    zh: count === 1 ? "个地点已就绪" : "个地点已就绪",
    de: count === 1 ? "Ort bereit" : "Orte bereit",
  };

  return `${count} ${labels[state.language] || labels.en}`;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters <= 0) {
    return "";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const kilometers = meters / 1000;
  return `${kilometers >= 10 ? Math.round(kilometers) : kilometers.toFixed(1)} km`;
}

function getRealtimeLanguageCode() {
  return ["es", "en", "fr", "pt", "ja", "ko", "ar", "zh", "de"].includes(state.language)
    ? state.language
    : "en";
}

function hasUsefulLiveContext() {
  const hasLocation = Boolean(state.location?.coords && state.location?.displayName);
  const hasWeather = Boolean(state.weather?.current_weather);
  const hasNearby = !isConfigured(GOOGLE_API_KEY) || state.nearbyPlaces.length > 0;
  return hasLocation && hasWeather && hasNearby;
}

function clearPendingVoiceResponseTimer() {
  if (state.realtime.pendingVoiceResponseTimer) {
    clearTimeout(state.realtime.pendingVoiceResponseTimer);
    state.realtime.pendingVoiceResponseTimer = null;
  }
}

function getVoiceRetryMessage() {
  const labels = {
    es: "No alcance a entenderte bien. Intenta repetirlo y te respondo con el contexto de tu ubicacion.",
    en: "I could not catch that clearly. Please repeat it and I will answer using your live location context.",
  };
  return labels[state.language] || labels.en;
}

function getVoiceVisualizerCopy() {
  if (!state.user) {
    return {
      title: t("assistantTitle"),
      hint: t("loginRequired"),
    };
  }

  if (!state.realtime.connected && !state.realtime.connecting) {
    return {
      title: t("assistantTitle"),
      hint: t("assistantSubtitle"),
    };
  }

  if (state.realtime.connecting) {
    return {
      title: t("connect"),
      hint: t("refreshContext"),
    };
  }

  if (state.realtime.assistantSpeaking) {
    return {
      title: state.language === "en" ? "The guide is speaking." : "La guia te esta respondiendo.",
      hint: state.language === "en"
        ? "The animation shrinks while the assistant is talking."
        : "La animacion se hace pequena mientras la IA esta hablando.",
    };
  }

  if (!state.realtime.micEnabled) {
    return {
      title: t("speechMuted"),
      hint: getMicFallbackMessage(),
    };
  }

  return {
    title: t("speechReady"),
    hint: `${
      state.location?.locality || state.location?.region || state.location?.country || state.location?.displayName || DEFAULT_COORDS.name
    } · ${buildWeatherMood()}`,
  };
}

function setAssistantSpeaking(isSpeaking) {
  const nextValue = Boolean(isSpeaking);
  if (state.realtime.assistantSpeaking === nextValue) {
    return;
  }
  state.realtime.assistantSpeaking = nextValue;
  renderAssistant();
}

function renderAccordionPanels() {
  const selectedPlace = findPlace(state.selectedPlaceId);
  const panels = {
    overview: {
      element: els.overviewAccordion,
      titleElement: els.overviewAccordionTitle,
      hintElement: els.overviewAccordionHint,
      iconElement: els.overviewAccordionIcon,
      title: `${t("locationCardLabel")} · ${t("weatherCardLabel")} · ${t("timingCardLabel")}`,
      hint: state.location?.displayName || t("locationLoading"),
    },
    map: {
      element: els.mapAccordion,
      titleElement: els.mapAccordionTitle,
      hintElement: els.mapAccordionHint,
      iconElement: els.mapAccordionIcon,
      title: t("mapTitle"),
      hint: selectedPlace?.name || t("mapSubtitle"),
    },
    nearby: {
      element: els.nearbyAccordion,
      titleElement: els.nearbyAccordionTitle,
      hintElement: els.nearbyAccordionHint,
      iconElement: els.nearbyAccordionIcon,
      title: t("nearbyTitle"),
      hint: state.nearbyPlaces.length ? formatNearbyCount(state.nearbyPlaces.length) : t("emptyNearby"),
    },
    plan: {
      element: els.planAccordion,
      titleElement: els.planAccordionTitle,
      hintElement: els.planAccordionHint,
      iconElement: els.planAccordionIcon,
      title: t("planTitle"),
      hint: state.plan.length ? `${state.plan.length} ${t("planCount")}` : t("emptyPlan"),
    },
  };

  Object.entries(panels).forEach(([key, panel]) => {
    const isOpen = Boolean(state.accordions[key]);
    panel.titleElement.textContent = panel.title;
    panel.hintElement.textContent = panel.hint;
    panel.iconElement.textContent = isOpen ? "−" : "+";
    panel.element.classList.toggle("is-collapsed", !isOpen);

    const toggle = panel.element.querySelector("[data-accordion-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  });
}

function renderAuthGate() {
  els.authEyebrow.textContent = "";
  els.authTitle.textContent = getCompactAuthTitle();
  els.authSubtitle.textContent = "";
  els.authBullets.innerHTML = "";

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
  els.authLegal.textContent = "";

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
  els.brandSubtitle.textContent = "";
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
  els.languageQuickBtn.textContent = lang.flag;
  els.languageQuickBtn.title = t("changeLanguage");
  els.languageQuickBtn.setAttribute("aria-label", t("changeLanguage"));
  els.locateBtn.textContent = t("locate");
  els.refreshBtn.textContent = t("refresh");
  els.heroEyebrow.textContent = "";
  els.heroTitle.textContent = "";
  els.heroSubtitle.textContent = "";
  els.suggestionBtn.textContent = micro("suggestionButton");
  els.suggestionHeading.textContent = micro("suggestionHeadingCompact");
  els.suggestionText.textContent = state.quickSuggestion || getSuggestionLoadingText();
  els.acceptSuggestionBtn.textContent = getAcceptPlanLabel();
  els.rejectSuggestionBtn.textContent = getRejectPlanLabel();
  els.heroSuggestionCard.hidden = !state.suggestionVisible;
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
  els.weatherCompact.innerHTML = state.weather
    ? `<span class="weather-compact__icon">${weatherGlyph(state.weather.current_weather.weathercode)}</span><span>${escapeHtml(formatTemperature(state.weather.current_weather.temperature))}</span>`
    : `<span class="weather-compact__icon">--</span><span>${escapeHtml(t("weatherLoading"))}</span>`;
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

function renderSectionNav() {
  const buttons = [
    ["assistant", els.assistantSectionBtn, t("assistantTitle")],
    ["map", els.mapSectionBtn, t("mapTitle")],
    ["nearby", els.nearbySectionBtn, t("nearbyTitle")],
    ["plan", els.planSectionBtn, t("planTitle")],
  ];

  buttons.forEach(([section, button, label]) => {
    if (!button) {
      return;
    }
    button.title = label;
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-active", state.activeSection === section);
  });
}

function renderSectionPanels() {
  [els.assistantPanel, els.mapAccordion, els.nearbyAccordion, els.planAccordion].forEach((panel) => {
    if (!panel) {
      return;
    }
    panel.classList.toggle("is-active", panel.dataset.sectionPanel === state.activeSection);
  });

  els.menuDrawer.classList.toggle("is-open", state.menuOpen);
  els.menuBackdrop.classList.toggle("is-open", state.menuOpen);
  els.menuDrawer.setAttribute("aria-hidden", state.menuOpen ? "false" : "true");
  els.menuToggleBtn.setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
}

function renderNearby() {
  els.nearbyTitle.textContent = t("nearbyTitle");
  els.nearbySubtitle.textContent = t("nearbySubtitle");
  els.nearbyFilterRow.innerHTML = NEARBY_FILTERS
    .map((filter) => `
      <button class="tiny-button ${state.nearbyFilter === filter.id ? "is-active" : ""}" type="button" data-nearby-filter="${filter.id}">
        ${escapeHtml(getNearbyFilterLabel(filter))}
      </button>
    `)
    .join("");

  const visiblePlaces = getFilteredNearbyPlaces();

  if (!visiblePlaces.length) {
    els.nearbyGrid.innerHTML = `<div class="empty-state">${escapeHtml(
      isConfigured(GOOGLE_API_KEY) ? t("emptyNearby") : t("mapsMissing")
    )}</div>`;
    return;
  }

  els.nearbyGrid.innerHTML = visiblePlaces
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
              getPlaceTypeLabel(place.category)
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

function renderGeneratedPlan() {
  if (!state.generatedPlan?.items?.length) {
    els.generatedPlan.innerHTML = `<div class="empty-state">${escapeHtml(micro("generatedPlanEmpty"))}</div>`;
    return;
  }

  const builtPlan = state.generatedPlan;
  els.generatedPlan.innerHTML = `
    <article class="generated-plan__header">
      <strong>${escapeHtml(builtPlan.name)}</strong>
      <span>${escapeHtml(`${formatDayOnly(builtPlan.date)} · ${builtPlan.travelMode}`)}</span>
      <p>${escapeHtml(`${micro("generatedPlanSummary")}: ${builtPlan.summary}`)}</p>
    </article>
    ${builtPlan.items
      .map((item, index) => `
        <div class="generated-plan__segment">
          <strong>${escapeHtml(
            `${index === 0 ? micro("generatedPlanOrigin") : item.routeFromPrevious.originLabel} → ${item.name}`
          )}</strong>
          <span>${escapeHtml(
            [item.routeFromPrevious.durationText, item.routeFromPrevious.distanceText].filter(Boolean).join(" · ")
          )}</span>
          <span class="generated-plan__traffic generated-plan__traffic--${escapeHtml(item.routeFromPrevious.trafficColor)}">
            ${escapeHtml(item.routeFromPrevious.trafficLabel)}
          </span>
        </div>
        <article class="generated-plan__card">
          <div class="generated-plan__body">
            <h3 class="generated-plan__title">${escapeHtml(item.name)}</h3>
            <div class="generated-plan__times">
              <span class="generated-plan__time">${escapeHtml(`${item.startLabel} - ${item.endLabel}`)}</span>
              <span class="generated-plan__time">${escapeHtml(item.visitText)}</span>
            </div>
            <p>${escapeHtml(item.address || "")}</p>
            <span class="generated-plan__status generated-plan__status--${escapeHtml(item.availability.tone)}">
              ${escapeHtml(item.availability.label)}
            </span>
            ${item.availability.detail ? `<p>${escapeHtml(item.availability.detail)}</p>` : ""}
            <div class="card-actions">
              ${item.mapsUrl ? `<button class="action-button" type="button" data-open-generated-place="${escapeHtml(item.placeId)}">${escapeHtml(t("openMaps"))}</button>` : ""}
            </div>
          </div>
        </article>
      `)
      .join("")}
  `;
}

function renderSavedPlans() {
  if (!state.savedPlans.length) {
    els.savedPlansList.innerHTML = `<div class="empty-state">${escapeHtml(micro("generatedPlanEmpty"))}</div>`;
    return;
  }

  els.savedPlansList.innerHTML = sortSavedPlans(state.savedPlans)
    .map((plan) => {
      const isExpanded = state.expandedSavedPlanId === plan.id;
      return `
        <article class="saved-plan-card">
          <button class="saved-plan-card__toggle" type="button" data-saved-plan-toggle="${plan.id}">
            <span class="saved-plan-card__title">${escapeHtml(plan.name || t("planTitle"))}</span>
            <span class="saved-plan-card__meta">${escapeHtml(`${formatDayOnly(plan.date)} · ${plan.travelMode || (t("travelModes")[state.travelMode] || state.travelMode)}`)}</span>
            <span class="saved-plan-card__summary">${escapeHtml(plan.summary || "")}</span>
          </button>
          <div class="saved-plan-card__body" ${isExpanded ? "" : "hidden"}>
            ${(plan.items || [])
              .map((item) => `
                <div class="saved-plan-card__segment">
                  <strong>${escapeHtml(`${item.startLabel || ""} · ${item.name || ""}`)}</strong>
                  <span>${escapeHtml([item.routeFromPrevious?.durationText, item.routeFromPrevious?.distanceText].filter(Boolean).join(" · "))}</span>
                  <span>${escapeHtml(item.availability?.label || "")}</span>
                </div>
              `)
              .join("")}
            <div class="card-actions">
              <button class="action-button action-button--primary" type="button" data-edit-saved-plan="${plan.id}">${escapeHtml(getEditLabel())}</button>
              <button class="action-button" type="button" data-delete-saved-plan="${plan.id}">${escapeHtml(getDeleteLabel())}</button>
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
  els.draftPlanTabBtn.textContent = getDraftPlanLabel();
  els.savedPlansTabBtn.textContent = getSavedPlansLabel();
  els.draftPlanTabBtn.classList.toggle("is-active", state.planWorkspace === "draft");
  els.savedPlansTabBtn.classList.toggle("is-active", state.planWorkspace === "saved");
  els.draftPlanWorkspace.hidden = state.planWorkspace !== "draft";
  els.savedPlansWorkspace.hidden = state.planWorkspace !== "saved";
  els.openPlanBuilderBtn.textContent = micro("planCreateButton");
  els.openPlanBuilderBtn.disabled = !state.plan.length;

  if (!state.plan.length) {
    els.planGrid.innerHTML = `<div class="empty-state">${escapeHtml(t("emptyPlan"))}</div>`;
  } else {
    els.planGrid.innerHTML = state.plan
      .map((place, index) => `
        <article class="plan-card" draggable="true" data-plan-drag="${place.id}">
          <div class="plan-card__body">
            <div class="plan-card__top">
              <span class="plan-card__order">${index + 1}</span>
              <button class="plan-card__drag" type="button" title="${escapeHtml(micro("reorderHint"))}">↕</button>
            </div>
            <h3 class="plan-card__title">${escapeHtml(place.name)}</h3>
            <div class="plan-card__meta">
              <span class="mini-tag">${escapeHtml(getPlaceTypeLabel(place.category))}</span>
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
  renderGeneratedPlan();
  renderSavedPlans();
}

function renderAssistant() {
  const voiceCopy = getVoiceVisualizerCopy();

  els.assistantTitle.textContent = t("assistantTitle");
  els.assistantSubtitle.textContent = t("assistantSubtitle");
  els.voiceModeBtn.textContent = getAssistantModeLabel("voice");
  els.textModeBtn.textContent = getAssistantModeLabel("text");
  els.voiceModeBtn.classList.toggle("is-active", state.assistantMode === "voice");
  els.textModeBtn.classList.toggle("is-active", state.assistantMode === "text");
  els.assistantVoicePane.classList.toggle("assistant-pane--hidden", state.assistantMode !== "voice");
  els.assistantTextPane.classList.toggle("assistant-pane--hidden", state.assistantMode !== "text");
  els.voiceVisual.classList.toggle("is-speaking", state.realtime.assistantSpeaking);
  els.voiceVisual.classList.toggle("is-listening", !state.realtime.assistantSpeaking);
  els.voiceVisualizerTitle.textContent = voiceCopy.title;
  els.voiceVisualizerHint.textContent = voiceCopy.hint;
  els.chatMenuBtn.title = getChatMenuLabel();
  els.chatMenuBtn.setAttribute("aria-label", getChatMenuLabel());
  els.chatMenuBtn.setAttribute("aria-expanded", state.chatMenuOpen ? "true" : "false");
  els.chatMenuPanel.hidden = !state.chatMenuOpen;
  els.chatMenuNewBtn.textContent = getNewChatMenuLabel();
  els.connectBtn.textContent = t("connect");
  els.disconnectBtn.textContent = t("disconnect");
  els.contextBtn.textContent = t("refreshContext");
  els.micBtn.textContent = state.realtime.micEnabled ? t("micOn") : t("micOff");
  els.voiceBtn.textContent = state.realtime.voiceEnabled ? t("voiceOn") : t("voiceOff");
  els.voiceSessionBtn.textContent = state.realtime.connected || state.realtime.connecting
    ? micro("voiceStop")
    : micro("voiceStart");
  els.connectionStatus.classList.toggle("is-live", state.realtime.connected);
  els.connectionStatusText.textContent = state.realtime.connected ? t("online") : t("offline");
  els.locationStatusText.textContent = state.realtime.connected
    ? state.realtime.micEnabled ? t("speechReady") : t("speechMuted")
    : state.location ? t("locating") : t("locatingBusy");
  els.assistantNotice.textContent = !state.user
    ? t("loginRequired")
    : hasRealtimeAuth()
      ? ""
      : t("openaiMissing");
  els.chatInput.placeholder = getMessagePlaceholder();
  els.sendBtn.textContent = t("send");
  els.disconnectBtn.disabled = !state.realtime.connected && !state.realtime.connecting;
  els.connectBtn.disabled = !state.user || state.realtime.connected || state.realtime.connecting;
  els.contextBtn.disabled = !state.user || !state.realtime.connected;
  els.voiceSessionBtn.disabled = !state.user || !hasRealtimeAuth();
  els.voiceModeBtn.disabled = !state.user;
  els.textModeBtn.disabled = !state.user;
  els.chatMenuBtn.disabled = !state.user;
  els.chatMenuNewBtn.disabled = !state.user;
  els.chatInput.disabled = !state.user;
  els.sendBtn.disabled = !state.user;
  els.quickPrompts.innerHTML = [t("quick1"), t("quick2"), t("quick3"), t("quick4")]
    .map((prompt) => `<button class="tiny-button" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
    .join("");
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
        <div class="thread-item-row">
          <button class="thread-item ${chat.id === state.activeChatId ? "is-active" : ""}" type="button" data-chat-id="${chat.id}">
            <span class="thread-item__title">${escapeHtml(chat.title)}</span>
            <span class="thread-item__meta">${escapeHtml(meta)}</span>
            <span class="thread-item__preview">${escapeHtml(preview.slice(0, 84))}</span>
          </button>
          <button class="thread-item__delete" type="button" data-delete-chat="${chat.id}" aria-label="${escapeHtml(getDeleteChatLabel())}" title="${escapeHtml(getDeleteChatLabel())}">
            x
          </button>
        </div>
      `;
    })
    .join("");
}

function renderChat() {
  if (!state.messages.length) {
    els.chatLog.innerHTML = "";
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

function renderPlanBuilder() {
  els.planBuilderTitle.textContent = micro("planBuilderTitle");
  els.planBuilderHint.textContent = micro("planBuilderHint");
  els.planNameLabel.textContent = micro("planNameLabel");
  els.planDateLabel.textContent = micro("planDateLabel");
  els.planStartTimeLabel.textContent = micro("planStartTimeLabel");
  els.planTravelModeLabel.textContent = getPlanTravelModeLabel();
  els.planTravelModeInput.innerHTML = Object.entries(t("travelModes"))
    .map(([mode, label]) => `<option value="${escapeHtml(mode)}">${escapeHtml(label)}</option>`)
    .join("");
  els.planNameInput.placeholder = micro("planNamePlaceholder");
  els.planBuilderCancelBtn.textContent = micro("planBuilderCancel");
  els.planBuilderSubmitBtn.textContent = micro("planBuilderSubmit");
  els.planBuilderSheet.classList.toggle("is-open", state.planBuilderOpen);

  if (!els.planDateInput.value) {
    els.planDateInput.value = state.generatedPlan?.date || getTodayIso();
  }
  if (!els.planStartTimeInput.value) {
    els.planStartTimeInput.value = state.generatedPlan?.startTime || "10:00";
  }
  if (!els.planNameInput.value) {
    els.planNameInput.value = state.generatedPlan?.name || "";
  }
  els.planTravelModeInput.value = state.generatedPlan?.travelModeKey || state.travelMode;
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
    if (state.activeSection === "map" && state.maps.ready) {
      ensureMapView();
    }
  }
  if (!state.maps.ready || !state.maps.map) {
    els.mapCanvas.className = "map-empty";
    els.mapCanvas.textContent = t("locationLoading");
    return;
  }
  els.mapCanvas.className = "";
  els.mapCanvas.textContent = "";
}

function renderAll() {
  renderLanguageGate();
  renderAuthGate();
  renderHero();
  renderSummaryCards();
  renderSectionNav();
  renderSectionPanels();
  renderTravelModes();
  renderMap();
  renderNearby();
  renderPlan();
  renderAssistant();
  renderThreads();
  renderChat();
  renderPlanBuilder();
}

function normalizePlace(place, category) {
  const openNow = typeof place.opening_hours?.isOpen === "function"
    ? place.opening_hours.isOpen()
    : null;
  const lat = typeof place.geometry?.location?.lat === "function"
    ? place.geometry.location.lat()
    : place.geometry?.location?.lat;
  const lng = typeof place.geometry?.location?.lng === "function"
    ? place.geometry.location.lng()
    : place.geometry?.location?.lng;
  const photo = place.photos?.[0]?.getUrl
    ? place.photos[0].getUrl({ maxWidth: 900, maxHeight: 600 })
    : "";
  const distanceMeters = lat && lng && state.location?.coords
    ? computeDistanceMeters(state.location.coords, { lat, lng })
    : null;

  return {
    id: place.place_id,
    name: place.name || "Place",
    address: place.formatted_address || place.vicinity || "",
    location: lat && lng ? { lat, lng } : null,
    rating: place.rating || null,
    userRatingsTotal: place.user_ratings_total || null,
    priceLevel: place.price_level ?? null,
    openNow,
    distanceMeters,
    mapsUrl: place.url || "",
    website: place.website || "",
    phone: place.international_phone_number || "",
    category,
    photo,
    openingHours: place.opening_hours?.weekday_text || [],
    openingHoursPeriods: Array.isArray(place.opening_hours?.periods) ? place.opening_hours.periods : [],
    editorialSummary: place.editorial_summary?.overview || "",
  };
}

async function loadGoogleMaps() {
  if (state.maps.ready || state.maps.loading || !isConfigured(GOOGLE_API_KEY)) {
    return;
  }

  state.maps.loading = true;
  try {
    await new Promise((resolve, reject) => {
      if (window.google?.maps?.Map) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[data-google-maps="true"]');
      if (existing) {
        const waitForGoogleMaps = () => {
          if (window.google?.maps?.Map) {
            resolve();
            return;
          }
          setTimeout(waitForGoogleMaps, 100);
        };
        waitForGoogleMaps();
        return;
      }

      const callbackName = "__mindfrontGoogleMapsReady";
      window[callbackName] = () => {
        delete window[callbackName];
        resolve();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        GOOGLE_API_KEY
      )}&libraries=places,geometry&v=weekly&loading=async&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "true";
      script.addEventListener("error", () => {
        delete window[callbackName];
        reject(new Error("Google Maps script failed to load"));
      }, { once: true });
      document.head.appendChild(script);
    });

    state.maps.ready = true;
    state.maps.serviceHost = document.createElement("div");
    state.maps.serviceHost.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(state.maps.serviceHost);
    state.maps.geocoder = new google.maps.Geocoder();
    state.maps.directionsService = new google.maps.DirectionsService();
    state.maps.placesService = new google.maps.places.PlacesService(state.maps.serviceHost);
  } finally {
    state.maps.loading = false;
  }
}

function ensureMapView() {
  if (!state.maps.ready || state.maps.map) {
    return;
  }

  state.maps.map = new google.maps.Map(els.mapCanvas, {
    center: state.location?.coords || DEFAULT_COORDS,
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  });
  state.maps.directionsRenderer = new google.maps.DirectionsRenderer({
    map: state.maps.map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: "#8fd4ff",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    },
  });
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
    locality: "",
    region: "",
    country: "",
    countryCode: "",
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
    const components = Object.fromEntries(
      (result.address_components || []).flatMap((component) =>
        (component.types || []).map((type) => [type, component])
      )
    );
    state.location.locality = components.locality?.long_name
      || components.sublocality?.long_name
      || components.administrative_area_level_2?.long_name
      || "";
    state.location.region = components.administrative_area_level_1?.long_name || "";
    state.location.country = components.country?.long_name || "";
    state.location.countryCode = components.country?.short_name || "";
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

function mergeNearbyPlaces(places) {
  const merged = [...state.nearbyPlaces];
  const known = new Set(merged.map((place) => place.id));

  for (const place of places) {
    if (place?.id && !known.has(place.id)) {
      known.add(place.id);
      merged.push(place);
    }
  }

  state.nearbyPlaces = merged
    .filter(Boolean)
    .sort((a, b) => scorePlaceForMoment(b) - scorePlaceForMoment(a))
    .slice(0, 18);
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

function scoreExpandedPlace(place) {
  const ratingScore = Number(place.rating || 0) * 3;
  const popularityScore = Math.log10((Number(place.userRatingsTotal) || 0) + 1) * 2;
  const distancePenalty = Number(place.distanceMeters || 0) / 1000 * 0.25;
  const openBonus = place.openNow === true ? 1.5 : place.openNow === false ? -2 : 0;
  return ratingScore + popularityScore + openBonus - distancePenalty;
}

async function searchPlacesByCategoryWithExpansion(
  category,
  {
    targetCount = 5,
    radii = [3200, 7000, 12000, 20000, 35000, 50000],
  } = {}
) {
  if (!state.maps.ready || !state.maps.placesService || !state.location?.coords) {
    return [];
  }

  const origin = new google.maps.LatLng(state.location.coords.lat, state.location.coords.lng);
  const collected = [];
  const seen = new Set();

  for (const radius of radii) {
    const results = await nearbySearch({
      location: origin,
      radius,
      type: category,
    });

    for (const place of results.slice(0, 6)) {
      if (!place?.place_id || seen.has(place.place_id)) {
        continue;
      }
      seen.add(place.place_id);
      const detail = await placeDetails(place.place_id);
      const normalized = detail ? normalizePlace(detail, category) : null;
      if (normalized) {
        collected.push(normalized);
      }
    }

    if (collected.length >= targetCount) {
      break;
    }
  }

  return collected
    .sort((a, b) => scoreExpandedPlace(b) - scoreExpandedPlace(a))
    .slice(0, targetCount);
}

async function ensureNearbyFilterData(filterId = state.nearbyFilter) {
  const filter = getNearbyFilterConfig(filterId);
  if (!filter.types.length || !state.maps.ready || !state.maps.placesService || !state.location?.coords) {
    return;
  }

  const alreadyCovered = filter.types.every(
    (type) => state.nearbyPlaces.some((place) => place.category === type) || state.nearbyFilterLoaded[type]
  );

  if (alreadyCovered) {
    return;
  }

  const batches = await Promise.all(
    filter.types.map(async (type) => {
      const matches = await searchPlacesByCategoryWithExpansion(type, { targetCount: 4 });
      state.nearbyFilterLoaded[type] = true;
      return matches;
    })
  );

  mergeNearbyPlaces(batches.flat());
  if (state.activeSection === "map") {
    renderMarkers();
  }
  renderNearby();
}

function detectRequestedCategories(text) {
  const source = String(text || "").toLowerCase();
  const matches = [];

  const categoryMatchers = [
    ["museum", /\bmuseo|museos|museum|museums|galeria|galería|art[e]?|arte\b/],
    ["restaurant", /\brestaurante|restaurantes|restaurant|restaurants|comida|food|cenar|dinner|almorz|lunch/],
    ["cafe", /\bcafe|caf[eé]s|coffee|brunch|desayuno|breakfast/],
    ["tourist_attraction", /\batraccion|atracción|atracciones|tourist|mirador|landmark|paseo|walk|walks|historia|history|cultural/],
    ["lodging", /\bhotel|hoteles|alojamiento|hospedaje|lodging|stay\b/],
    ["park", /\bparque|park|outdoor|aire libre|naturaleza|nature\b/],
    ["shopping_mall", /\bcompras|shopping|mall|tiendas|store\b/],
    ["night_club", /\bbar|antro|vida nocturna|nightlife|club\b/],
  ];

  for (const [category, pattern] of categoryMatchers) {
    if (pattern.test(source)) {
      matches.push(category);
    }
  }

  return [...new Set(matches)];
}

async function primeContextForRequest(userText) {
  const requestedCategories = detectRequestedCategories(userText);
  let updated = false;

  for (const category of requestedCategories) {
    const currentMatches = state.nearbyPlaces.filter((place) => place.category === category);
    if (currentMatches.length >= 3) {
      continue;
    }

    const expandedMatches = await searchPlacesByCategoryWithExpansion(category, { targetCount: 6 });
    if (expandedMatches.length) {
      mergeNearbyPlaces(expandedMatches);
      updated = true;
    }
  }

  if (updated && state.maps.ready) {
    renderMarkers();
  }
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
    .sort((a, b) => scorePlaceForMoment(b) - scorePlaceForMoment(a))
    .slice(0, 8);
  TRAVEL_CATEGORIES.forEach((category) => {
    state.nearbyFilterLoaded[category] = true;
  });
}

function clearMarkers() {
  state.maps.markers.forEach((marker) => marker.setMap?.(null));
  state.maps.markers = [];
}

function renderMarkers() {
  if (!state.maps.map) {
    if (state.activeSection !== "map") {
      return;
    }
    ensureMapView();
  }
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

function buildRouteSummary(leg) {
  const travelText = leg.duration_in_traffic?.text || leg.duration?.text || "";
  return `${travelText} · ${leg.distance?.text || ""}`.trim();
}

async function getRouteBetween(origin, destination, { render = false, departureTime = null, travelMode = state.travelMode } = {}) {
  if (!origin || !destination || !state.maps.directionsService) {
    return null;
  }

  const request = {
    origin,
    destination,
    travelMode: google.maps.TravelMode[travelMode] || google.maps.TravelMode[state.travelMode],
  };

  if (travelMode === "DRIVING" && departureTime instanceof Date) {
    request.drivingOptions = {
      departureTime,
      trafficModel: "bestguess",
    };
  }

  const result = await state.maps.directionsService.route(request);

  if (render && state.maps.directionsRenderer) {
    state.maps.directionsRenderer.setDirections(result);
  }

  const leg = result.routes?.[0]?.legs?.[0];
  if (!leg) {
    return null;
  }

  const trafficDurationValue = Number(leg.duration_in_traffic?.value) || 0;
  const trafficRatio = trafficDurationValue && Number(leg.duration?.value)
    ? trafficDurationValue / Number(leg.duration.value)
    : 1;

  let trafficColor = "green";
  let trafficLabel = micro("trafficLow");

  if (trafficRatio > 1.2) {
    trafficColor = "red";
    trafficLabel = micro("trafficHigh");
  } else if (trafficRatio > 1.05) {
    trafficColor = "yellow";
    trafficLabel = micro("trafficMedium");
  }

  return {
    duration: leg.duration?.text || "",
    distance: leg.distance?.text || "",
    durationValue: Number(leg.duration?.value) || 0,
    durationInTraffic: leg.duration_in_traffic?.text || "",
    durationInTrafficValue: trafficDurationValue,
    distanceValue: Number(leg.distance?.value) || 0,
    startAddress: leg.start_address || "",
    endAddress: leg.end_address || "",
    summary: buildRouteSummary(leg),
    trafficColor,
    trafficLabel,
  };
}

function formatMinutesLabel(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }
  if (!minutes) {
    return `${hours} h`;
  }
  return `${hours} h ${minutes} min`;
}

async function calculateRouteLegacy(placeId) {
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
  invalidateGeneratedPlan();
  savePlan();
  scheduleMemoryRefresh();
  schedulePersist();
  renderPlan();
  renderHero();
}

function addSuggestedPlacesToPlan(limit = 3) {
  const suggestedPlaces = getRecommendedPlaces(limit);
  let added = 0;

  suggestedPlaces.forEach((place) => {
    if (!place || state.plan.some((item) => item.id === place.id)) {
      return;
    }

    state.plan = [...state.plan, { ...place, routeSummary: t("routeNone") }];
    added += 1;
  });

  if (!added) {
    return 0;
  }

  invalidateGeneratedPlan();
  savePlan();
  scheduleMemoryRefresh();
  schedulePersist();
  return added;
}

function removePlaceFromPlan(placeId) {
  state.plan = state.plan.filter((place) => place.id !== placeId);
  invalidateGeneratedPlan();
  savePlan();
  scheduleMemoryRefresh();
  schedulePersist();
  renderPlan();
  renderHero();
}

async function composeItinerary({
  placeIds = [],
  durationHours = 4,
  stopCount = 3,
  preferSaved = true,
} = {}) {
  if (!state.location?.coords) {
    return { error: t("locationLoading") };
  }

  const requestedPlaces = Array.isArray(placeIds)
    ? placeIds.map((placeId) => findPlace(placeId)).filter(Boolean)
    : [];
  const sourcePlaces = requestedPlaces.length
    ? requestedPlaces
    : preferSaved && state.plan.length
      ? state.plan
      : state.nearbyPlaces;
  const dedupedPlaces = [...new Map(sourcePlaces.map((place) => [place.id, place])).values()]
    .filter((place) => place?.location);
  const candidates = requestedPlaces.length
    ? dedupedPlaces
    : dedupedPlaces.sort((a, b) => scorePlaceForMoment(b) - scorePlaceForMoment(a)).slice(0, 6);

  if (!candidates.length) {
    return { error: t("emptyNearby") };
  }

  const maxStops = Math.max(1, Math.min(Number(stopCount) || 3, 4));
  const maxMinutes = Math.max(90, Math.min((Number(durationHours) || 4) * 60, 8 * 60));
  const remaining = [...candidates];
  const itinerary = [];
  let cursor = state.location.coords;
  let totalTravelMinutes = 0;
  let totalVisitMinutes = 0;
  const strategy = getWeatherStrategy();

  while (remaining.length && itinerary.length < maxStops) {
    let bestIndex = -1;
    let bestRoute = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const place = remaining[index];
      const route = await getRouteBetween(cursor, place.location);
      const travelMinutes = route ? Math.round(route.durationValue / 60) : 30;
      const visitMinutes = estimateVisitMinutes(place);
      const projectedTotal = totalTravelMinutes + totalVisitMinutes + travelMinutes + visitMinutes;
      const totalPenalty = projectedTotal > maxMinutes ? (projectedTotal - maxMinutes) * 2 : 0;
      const score = scorePlaceForMoment(place) - travelMinutes * 0.18 - totalPenalty;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
        bestRoute = route;
      }
    }

    if (bestIndex < 0) {
      break;
    }

    const place = remaining.splice(bestIndex, 1)[0];
    const visitMinutes = estimateVisitMinutes(place);
    const projectedTotal = totalTravelMinutes + totalVisitMinutes
      + Math.round((bestRoute?.durationValue || 0) / 60)
      + visitMinutes;

    if (itinerary.length && projectedTotal > maxMinutes) {
      break;
    }

    const travelMinutes = Math.round((bestRoute?.durationValue || 0) / 60);
    totalTravelMinutes += travelMinutes;
    totalVisitMinutes += visitMinutes;
    itinerary.push({
      id: place.id,
      name: place.name,
      category: place.category,
      address: place.address || "",
      distanceFromCurrent: place.distanceMeters ? formatDistance(place.distanceMeters) : "",
      travel: bestRoute || null,
      visit_minutes: visitMinutes,
      visit_text: formatMinutesLabel(visitMinutes),
      reason: buildPlaceReason(place),
      weather_fit: strategy,
      maps_url: place.mapsUrl || "",
    });
    cursor = place.location;
  }

  if (!itinerary.length) {
    return { error: t("noRoute") };
  }

  return {
    strategy,
    based_on_location: state.location.displayName || DEFAULT_COORDS.name,
    travel_mode: t("travelModes")[state.travelMode] || state.travelMode,
    weather: state.weather
      ? `${weatherLabel(state.weather.current_weather.weathercode)} ${formatTemperature(
          state.weather.current_weather.temperature
        )}`
      : t("weatherLoading"),
    total_travel_minutes: totalTravelMinutes,
    total_visit_minutes: totalVisitMinutes,
    total_estimated_minutes: totalTravelMinutes + totalVisitMinutes,
    total_estimated_text: formatMinutesLabel(totalTravelMinutes + totalVisitMinutes),
    itinerary,
  };
}

async function calculateRoute(placeId) {
  const place = findPlace(placeId);
  if (!place || !place.location || !state.maps.directionsService || !state.location?.coords) {
    return null;
  }

  ensureMapView();
  addRouteSummaryToPlan(placeId, t("routeBusy"));
  const route = await getRouteBetween(state.location.coords, place.location, { render: true });

  if (!route) {
    addRouteSummaryToPlan(placeId, t("noRoute"));
    return null;
  }

  addRouteSummaryToPlan(placeId, route.summary);
  return route;
}

function invalidateGeneratedPlan() {
  if (!state.generatedPlan) {
    return;
  }

  state.generatedPlan = null;
  saveGeneratedPlan();
  schedulePersist();
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
}

function weekdayLineForDate(place, date) {
  if (!Array.isArray(place?.openingHours) || !place.openingHours.length) {
    return "";
  }

  const jsDay = date.getDay();
  const mondayFirstIndex = jsDay === 0 ? 6 : jsDay - 1;
  return place.openingHours[mondayFirstIndex] || "";
}

function hhmmToMinutes(value) {
  const raw = String(value || "").replace(":", "");
  if (!/^\d{3,4}$/.test(raw)) {
    return 0;
  }

  const padded = raw.padStart(4, "0");
  return Number(padded.slice(0, 2)) * 60 + Number(padded.slice(2, 4));
}

function weeklyMinutes(date) {
  return date.getDay() * 1440 + date.getHours() * 60 + date.getMinutes();
}

function buildOpeningWindows(periods) {
  return periods.flatMap((period) => {
    const open = period?.open;
    const close = period?.close;

    if (!open) {
      return [];
    }

    const openTotal = Number(open.day || 0) * 1440 + hhmmToMinutes(open.time || "0000");
    let closeTotal = close
      ? Number(close.day || 0) * 1440 + hhmmToMinutes(close.time || "2359")
      : openTotal + 24 * 60;

    if (closeTotal <= openTotal) {
      closeTotal += 7 * 1440;
    }

    return [
      { start: openTotal, end: closeTotal },
      { start: openTotal - 7 * 1440, end: closeTotal - 7 * 1440 },
    ];
  });
}

function getOpeningStatus(place, startDate, endDate) {
  const periods = Array.isArray(place?.openingHoursPeriods) ? place.openingHoursPeriods : [];
  const dayLine = weekdayLineForDate(place, startDate);

  if (!periods.length) {
    return {
      tone: "neutral",
      label: micro("hoursUnknown"),
      detail: dayLine,
    };
  }

  const startTotal = weeklyMinutes(startDate);
  let endTotal = weeklyMinutes(endDate);
  if (endTotal < startTotal) {
    endTotal += 7 * 1440;
  }

  for (const window of buildOpeningWindows(periods)) {
    if (startTotal >= window.start && startTotal < window.end) {
      if (endTotal <= window.end) {
        return {
          tone: "ok",
          label: micro("hoursOk"),
          detail: dayLine,
        };
      }

      return {
        tone: "warn",
        label: micro("hoursWarn"),
        detail: dayLine,
      };
    }
  }

  return {
    tone: "bad",
    label: micro("hoursClosed"),
    detail: dayLine,
  };
}

function buildPlanSummary(plan) {
  return `${formatTimeOnly(new Date(plan.startDateTime))} - ${formatTimeOnly(new Date(plan.endDateTime))} · ${formatMinutesLabel(
    plan.totalTravelMinutes + plan.totalVisitMinutes
  )}`;
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const combined = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

async function buildTravelerPlan({
  name = "",
  date = getTodayIso(),
  startTime = "10:00",
  travelMode = state.travelMode,
} = {}) {
  const places = state.plan.filter((place) => place?.location);
  if (!places.length) {
    return { error: t("emptyPlan") };
  }

  const startDate = combineDateAndTime(date, startTime);
  if (!startDate) {
    return { error: micro("planBuilderHint") };
  }

  let cursorLocation = state.location?.coords || DEFAULT_COORDS;
  let cursorName = micro("generatedPlanOrigin");
  let cursorTime = new Date(startDate);
  let totalTravelMinutes = 0;
  let totalVisitMinutes = 0;
  const items = [];

  for (const place of places) {
    const route = await getRouteBetween(cursorLocation, place.location, {
      departureTime: cursorTime,
      travelMode,
    });
    const travelMinutes = route
      ? Math.max(1, Math.round((route.durationInTrafficValue || route.durationValue || 0) / 60))
      : 20;
    const visitMinutes = estimateVisitMinutes(place);
    const startAt = new Date(cursorTime.getTime() + travelMinutes * 60000);
    const endAt = new Date(startAt.getTime() + visitMinutes * 60000);
    const availability = getOpeningStatus(place, startAt, endAt);

    items.push({
      order: items.length + 1,
      placeId: place.id,
      name: place.name,
      category: place.category,
      address: place.address || "",
      mapsUrl: place.mapsUrl || "",
      routeFromPrevious: {
        originLabel: cursorName,
        durationText: route?.durationInTraffic || route?.duration || formatMinutesLabel(travelMinutes),
        distanceText: route?.distance || "",
        trafficColor: route?.trafficColor || "green",
        trafficLabel: route?.trafficLabel || micro("trafficLow"),
      },
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      startLabel: formatTimeOnly(startAt),
      endLabel: formatTimeOnly(endAt),
      visitMinutes,
      visitText: formatMinutesLabel(visitMinutes),
      availability,
    });

    totalTravelMinutes += travelMinutes;
    totalVisitMinutes += visitMinutes;
    cursorLocation = place.location;
    cursorName = place.name;
    cursorTime = endAt;
  }

  const builtPlan = {
    id: state.generatedPlan?.id || `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name || "").trim() || t("planTitle"),
    date,
    startTime,
    travelModeKey: travelMode,
    startDateTime: startDate.toISOString(),
    endDateTime: cursorTime.toISOString(),
    createdAt: Date.now(),
    travelMode: t("travelModes")[travelMode] || travelMode,
    basedOnLocation: state.location?.displayName || DEFAULT_COORDS.name,
    sourcePlaces: sanitizePlan(state.plan),
    totalTravelMinutes,
    totalVisitMinutes,
    summary: "",
    items,
  };
  builtPlan.summary = buildPlanSummary(builtPlan);
  state.generatedPlan = builtPlan;
  upsertSavedPlan(builtPlan);
  saveGeneratedPlan();
  schedulePersist();
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
  return builtPlan;
}

function movePlanItem(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return;
  }

  const fromIndex = state.plan.findIndex((item) => item.id === draggedId);
  const toIndex = state.plan.findIndex((item) => item.id === targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }

  const nextPlan = [...state.plan];
  const [moved] = nextPlan.splice(fromIndex, 1);
  nextPlan.splice(toIndex, 0, moved);
  state.plan = nextPlan;
  invalidateGeneratedPlan();
  savePlan();
  schedulePersist();
  renderPlan();
}

function upsertSavedPlan(plan) {
  if (!plan?.id) {
    return;
  }

  state.savedPlans = sortSavedPlans([
    ...state.savedPlans.filter((item) => item.id !== plan.id),
    cleanForStorage(plan),
  ]);
  state.expandedSavedPlanId = plan.id;
  saveSavedPlans();
}

function switchPlanWorkspace(workspace) {
  state.planWorkspace = workspace === "saved" ? "saved" : "draft";
  renderPlan();
}

function toggleSavedPlan(savedPlanId) {
  state.expandedSavedPlanId = state.expandedSavedPlanId === savedPlanId ? null : savedPlanId;
  renderSavedPlans();
}

function editSavedPlan(savedPlanId) {
  const savedPlan = state.savedPlans.find((plan) => plan.id === savedPlanId);
  if (!savedPlan) {
    return;
  }

  state.plan = sanitizePlan(savedPlan.sourcePlaces || []);
  state.generatedPlan = sanitizeGeneratedPlan(savedPlan);
  state.travelMode = savedPlan.travelModeKey || state.travelMode;
  state.planWorkspace = "draft";
  savePlan();
  saveGeneratedPlan();
  schedulePersist();
  renderAll();
}

function deleteSavedPlan(savedPlanId) {
  state.savedPlans = state.savedPlans.filter((plan) => plan.id !== savedPlanId);
  if (state.generatedPlan?.id === savedPlanId) {
    state.generatedPlan = null;
    saveGeneratedPlan();
  }
  if (state.expandedSavedPlanId === savedPlanId) {
    state.expandedSavedPlanId = null;
  }
  saveSavedPlans();
  schedulePersist();
  renderPlan();
}

function summarizePlaceForAssistant(place, index) {
  return `${index + 1}. ${place.name} | ${getPlaceTypeLabel(place.category)} | ${
    place.address || ""
  } | ${place.openNow === null ? t("unknownHours") : place.openNow ? t("openNow") : t("closedNow")} | ${
    Number.isFinite(place.rating) ? `rating ${place.rating}` : "rating n/a"
  } | ${formatPriceLevel(place.priceLevel)} | ${place.distanceMeters ? formatDistance(place.distanceMeters) : "distance n/a"} | ${
    buildPlaceReason(place) || "general fit"
  }`;
}

function buildLiveContextSnapshot(limit = 4) {
  const recommended = getRecommendedPlaces(limit).map(summarizePlaceForAssistant).join("\n");
  const savedPlan = state.plan
    .slice(0, limit)
    .map((place, index) => `${index + 1}. ${place.name} | ${place.routeSummary || t("routeNone")} | ${place.address || ""}`)
    .join("\n");
  const generatedPlan = state.generatedPlan?.items?.length
    ? [
        `${state.generatedPlan.name} | ${state.generatedPlan.date} | ${state.generatedPlan.summary}`,
        ...state.generatedPlan.items.map((item, index) => `${index + 1}. ${item.name} | ${item.startLabel}-${item.endLabel} | ${item.availability.label}`),
      ].join("\n")
    : "";
  const savedPlans = state.savedPlans.length
    ? sortSavedPlans(state.savedPlans)
        .slice(0, limit)
        .map((plan, index) => `${index + 1}. ${plan.name} | ${plan.date} | ${plan.summary}`)
        .join("\n")
    : "";
  const currentWeather = state.weather
    ? `${weatherLabel(state.weather.current_weather.weathercode)} ${formatTemperature(
        state.weather.current_weather.temperature
      )}`
    : t("weatherLoading");

  return `
LIVE CONTEXT. Use this as source of truth for every recommendation.
- Country: ${state.location?.country || "Unknown"}
- Region / state: ${state.location?.region || "Unknown"}
- City / locality: ${state.location?.locality || "Unknown"}
- Current place: ${state.location?.displayName || DEFAULT_COORDS.name}
- Coordinates: ${
    state.location?.coords ? `${state.location.coords.lat.toFixed(5)}, ${state.location.coords.lng.toFixed(5)}` : "Unknown"
  }
- Weather now: ${currentWeather}
- Weather strategy: ${getWeatherStrategy()}
- Preferred travel mode: ${t("travelModes")[state.travelMode] || state.travelMode}
- Traveler memory: ${state.memorySummary}

TOP LIVE CANDIDATES FROM GOOGLE:
${recommended || "No nearby places loaded yet."}

SAVED PLAN:
${savedPlan || "No saved activities yet."}

GENERATED DAY PLAN:
${generatedPlan || "No generated day plan yet."}

SAVED TRAVELER PLANS:
${savedPlans || "No saved plans yet."}
  `.trim();
}

function buildRequestScopedContext(userText, limit = 5) {
  const requestedCategories = detectRequestedCategories(userText);
  if (!requestedCategories.length) {
    return "";
  }

  const categoryMatches = requestedCategories
    .flatMap((category) => state.nearbyPlaces.filter((place) => place.category === category))
    .filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index)
    .sort((a, b) => scoreExpandedPlace(b) - scoreExpandedPlace(a))
    .slice(0, limit)
    .map(summarizePlaceForAssistant)
    .join("\n");

  if (!categoryMatches) {
    return `
PLACES MATCHING THE TRAVELER REQUEST:
No exact matches found yet even after expanding the search radius.
    `.trim();
  }

  return `
PLACES MATCHING THE TRAVELER REQUEST:
${categoryMatches}
  `.trim();
}

async function ensureFreshContext({ force = false } = {}) {
  const isStale = Date.now() - state.contextUpdatedAt > 180000;
  if (!force && !isStale && hasUsefulLiveContext()) {
    return;
  }

  if (!refreshContextPromise) {
    refreshContextPromise = refreshContext().finally(() => {
      refreshContextPromise = null;
    });
  }

  await refreshContextPromise;
}

function requestRealtimeResponseForTurn(userText = "") {
  const requestScopedContext = buildRequestScopedContext(userText);
  updateRealtimeSession();
  sendRealtimeEvent({
    type: "response.create",
    response: {
      output_modalities: state.realtime.voiceEnabled ? ["audio", "text"] : ["text"],
      instructions: `${buildTurnResponseInstructions(userText)}\n\n${buildLiveContextSnapshot(3)}${
        requestScopedContext ? `\n\n${requestScopedContext}` : ""
      }`,
    },
  });
}

async function requestVoiceResponseFromTranscript(transcript) {
  await ensureFreshContext();
  await primeContextForRequest(transcript);
  renderAll();
  updateRealtimeSession();
  requestRealtimeResponseForTurn(transcript);
}

function buildTurnResponseInstructions(userText = "") {
  const message = String(userText || "").toLowerCase();
  const asksForItinerary = /itiner|agenda|schedule|organi[sz]|ruta|route|plan de|plan for|roadmap|que hago hoy|what should i do/.test(
    message
  );
  const asksForSuggestion = /sugier|recom|what do you suggest|que me sugieres|what can i do|que hago|ideas|plan/.test(
    message
  );

  if (asksForItinerary) {
    return `Use only the current live context for the traveler location in ${state.location?.country || "the current country"}.
Call compose_itinerary before answering.
If the traveler asks to turn the saved stops into a timed day plan, call build_day_plan.
Explain the order, travel time, estimated time at each stop, and why it fits the weather and the current position.
If the traveler requests a specific kind of place and you do not see it in the short-radius context, call get_nearby_places with that category so the app can expand the search radius automatically.
Do not mention another country, city, cuisine, or cultural reference unless it appears in the live context or the traveler asks for it.`;
  }

  if (asksForSuggestion) {
    return `Do not answer generically.
Use the current traveler location, weather, nearby Google places, and saved plan.
Mention at least two named places from the live context and explain why they fit right now.
If nearby Google places are missing, say that clearly and avoid improvising local details.
If the traveler asks for a specific category such as museums, cafes, restaurants, or attractions and you do not have enough matching places, call get_nearby_places with that category to expand the search radius automatically.
Do not mention another country, city, cuisine, or cultural reference unless it appears in the live context or the traveler asks for it.`;
  }

  return `Use the live travel context and the latest traveler memory whenever it makes the answer more useful.
Never drift to another country or generic travel advice if the live context already gives you the current location.
If the traveler asks to save, remove, or schedule activities, use the tools instead of only describing what to do.`;
}

function buildRealtimeInstructions() {
  const language = langMeta().label;
  const locationName = state.location?.displayName || DEFAULT_COORDS.name;
  const weather = state.weather
    ? `${weatherLabel(state.weather.current_weather.weathercode)}, ${formatTemperature(
        state.weather.current_weather.temperature
      )}`
    : "Unavailable";
  const recommendedNow = getRecommendedPlaces(3).map(summarizePlaceForAssistant).join("\n");
  const nearby = state.nearbyPlaces.slice(0, 6).map(summarizePlaceForAssistant).join("\n");
  const plan = state.plan
    .map((place, index) => `${index + 1}. ${place.name} | ${place.routeSummary || ""} | ${buildPlaceReason(place)}`)
    .join("\n");
  const generatedPlan = state.generatedPlan?.items?.length
    ? [
        `${state.generatedPlan.name} | ${state.generatedPlan.date} | ${state.generatedPlan.summary}`,
        ...state.generatedPlan.items.map((item, index) => `${index + 1}. ${item.name} | ${item.startLabel}-${item.endLabel} | ${item.availability.label}`),
      ].join("\n")
    : "";
  const transcript = getRecentTranscript();

  return `
You are a warm, proactive tourism concierge for travelers.
Always reply in ${language}.
Be concise, useful, and practical.
Never give generic suggestions when live location, weather, nearby places, or saved plan data are available.
The current traveler is physically in ${state.location?.country || "the current country"}, specifically around ${
    state.location?.locality || state.location?.region || state.location?.displayName || DEFAULT_COORDS.name
  }.
Do not mention another country, city, cuisine, or regional cultural reference unless it appears in the live context below or the traveler explicitly asks for it.
If the traveler asks what to do, what you suggest, or for a plan, use named places from the live context and explain weather fit, route convenience, and expected pacing.
If the traveler asks for an itinerary, route order, or schedule, call compose_itinerary before answering.
If the traveler asks to save a place, remove one, or create a timed day plan, use the appropriate tool.
If the traveler asks for route details to a specific stop, call get_route_to_place.
If nearby Google place data is missing, say that you do not have live nearby places yet and avoid improvising local details.
Use the available tools whenever live data would improve the answer.
Do not invent exact prices or schedules if the live context does not include them.
Remember stable traveler preferences across turns and use them proactively when helpful.

Current travel context:
- Language: ${language}
- Current location: ${locationName}
- Current weather: ${weather}
- Travel mode preference: ${state.travelMode}
- Traveler memory: ${state.memorySummary}

Recommended right now:
${recommendedNow || "No recommendations available yet."}

Nearby places:
${nearby || "No live nearby places loaded yet."}

Traveler plan:
${plan || "No saved activities yet."}

Generated day plan:
${generatedPlan || "No generated day plan yet."}

Recent active chat:
${transcript || "No previous messages in this chat yet."}
  `.trim();
}

function buildRealtimeTools() {
  return [
    {
      type: "function",
      name: "get_live_context",
      description: "Get the latest location, weather, nearby places, recommended places, and saved plan.",
      parameters: { type: "object", properties: {} },
    },
    {
      type: "function",
      name: "get_nearby_places",
      description: "List nearby places, and if a requested category is missing nearby, expand the Google search radius automatically.",
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
      description: "Calculate route info from the traveler location to a known place by id or place name.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
          place_name: { type: "string" },
        },
      },
    },
    {
      type: "function",
      name: "compose_itinerary",
      description: "Build a practical itinerary using the current location, weather, travel mode, and available places.",
      parameters: {
        type: "object",
        properties: {
          place_ids: {
            type: "array",
            items: { type: "string" },
          },
          duration_hours: { type: "number" },
          stop_count: { type: "number" },
          prefer_saved: { type: "boolean" },
        },
      },
    },
    {
      type: "function",
      name: "save_activity_to_plan",
      description: "Save a known nearby place into the traveler plan by id or by place name.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
          place_name: { type: "string" },
          place_ids: {
            type: "array",
            items: { type: "string" },
          },
          place_names: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      name: "remove_activity_from_plan",
      description: "Remove an activity from the traveler plan by id or by place name.",
      parameters: {
        type: "object",
        properties: {
          place_id: { type: "string" },
          place_name: { type: "string" },
        },
      },
    },
    {
      type: "function",
      name: "build_day_plan",
      description: "Create a timed traveler plan using the saved activities, date, and start time.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          date: { type: "string" },
          start_time: { type: "string" },
        },
      },
    },
    {
      type: "function",
      name: "list_saved_plan",
      description: "Return all currently saved activities in the traveler plan and the generated timed plan if it exists.",
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
          transcription: {
            model: "gpt-4o-mini-transcribe",
            language: getRealtimeLanguageCode(),
          },
          turn_detection: {
            type: "semantic_vad",
            create_response: false,
            interrupt_response: true,
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
  let args = {};
  if (outputItem.arguments) {
    try {
      args = JSON.parse(outputItem.arguments);
    } catch {
      args = {};
    }
  }
  let result;

  switch (outputItem.name) {
    case "get_live_context":
      result = {
        location: state.location,
        weather: state.weather?.current_weather || null,
        weather_strategy: getWeatherStrategy(),
        travel_mode: t("travelModes")[state.travelMode] || state.travelMode,
        nearby_places: state.nearbyPlaces,
        recommended_now: getRecommendedPlaces(3),
        saved_plan: state.plan,
        generated_plan: state.generatedPlan,
        saved_plans: state.savedPlans,
      };
      break;
    case "get_nearby_places":
      if (args.category) {
        let matchingPlaces = state.nearbyPlaces.filter((place) => place.category === args.category);
        if (matchingPlaces.length < 3) {
          const expandedMatches = await searchPlacesByCategoryWithExpansion(args.category, { targetCount: 6 });
          if (expandedMatches.length) {
            mergeNearbyPlaces(expandedMatches);
            matchingPlaces = state.nearbyPlaces.filter((place) => place.category === args.category);
          }
        }
        result = {
          category: args.category,
          places: matchingPlaces,
          expanded_search: matchingPlaces.length > 0,
        };
      } else {
        result = {
          places: state.nearbyPlaces,
        };
      }
      break;
    case "get_route_to_place": {
      const targetPlace = args.place_id ? findPlace(args.place_id) : findPlaceByName(args.place_name);
      const route = targetPlace ? await calculateRoute(targetPlace.id) : null;
      result = route || { error: t("noRoute") };
      break;
    }
    case "compose_itinerary":
      result = await composeItinerary({
        placeIds: args.place_ids,
        durationHours: args.duration_hours,
        stopCount: args.stop_count,
        preferSaved: args.prefer_saved ?? true,
      });
      break;
    case "save_activity_to_plan": {
      const requestedIds = [
        ...(Array.isArray(args.place_ids) ? args.place_ids : []),
        ...(args.place_id ? [args.place_id] : []),
      ];
      const requestedNames = [
        ...(Array.isArray(args.place_names) ? args.place_names : []),
        ...(args.place_name ? [args.place_name] : []),
      ];
      const resolvedPlaces = [
        ...requestedIds.map((placeId) => findPlace(placeId)).filter(Boolean),
        ...requestedNames.map((placeName) => findPlaceByName(placeName)).filter(Boolean),
      ].filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index);

      resolvedPlaces.forEach((place) => addPlaceToPlan(place.id));
      result = { saved: resolvedPlaces.map((place) => place.name), plan: state.plan };
      break;
    }
    case "remove_activity_from_plan": {
      const targetPlace = args.place_id ? findPlace(args.place_id) : findPlaceByName(args.place_name);
      if (targetPlace) {
        removePlaceFromPlan(targetPlace.id);
      }
      result = { removed: Boolean(targetPlace), plan: state.plan };
      break;
    }
    case "build_day_plan":
      result = await buildTravelerPlan({
        name: args.name,
        date: args.date || getTodayIso(),
        startTime: args.start_time || "10:00",
      });
      renderPlan();
      break;
    case "list_saved_plan":
      result = { plan: state.plan, generated_plan: state.generatedPlan, saved_plans: state.savedPlans };
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
    setAssistantSpeaking(false);
    createAssistantMessage(event.response.id);
    return;
  }

  if (event.type === "response.output_text.delta") {
    appendAssistantDelta(event.response_id, event.delta);
    return;
  }

  if (event.type === "response.output_audio_transcript.delta") {
    if (state.realtime.voiceEnabled) {
      setAssistantSpeaking(true);
    }
    appendAssistantDelta(event.response_id, event.delta);
    return;
  }

  if (event.type === "input_audio_buffer.speech_started") {
    clearPendingVoiceResponseTimer();
    setAssistantSpeaking(false);
    els.locationStatusText.textContent = t("speechReady");
    return;
  }

  if (event.type === "input_audio_buffer.speech_stopped") {
    clearPendingVoiceResponseTimer();
    setAssistantSpeaking(false);
    els.locationStatusText.textContent = state.realtime.micEnabled ? t("speechReady") : t("speechMuted");
    return;
  }

  if (event.type === "conversation.item.input_audio_transcription.completed") {
    clearPendingVoiceResponseTimer();
    const transcript = String(
      event.transcript
      || event.item?.content?.find?.((content) => content.transcript)?.transcript
      || ""
    ).trim();
    const itemId = event.item_id || event.item?.id || `audio-${Date.now()}`;

    if (transcript && !state.realtime.handledAudioItems[itemId]) {
      state.realtime.handledAudioItems[itemId] = true;
      pushMessage("user", transcript);
    }

    if (!transcript) {
      pushMessage("assistant", getVoiceRetryMessage());
      return;
    }

    await requestVoiceResponseFromTranscript(transcript);
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
      requestRealtimeResponseForTurn("");
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
    setAssistantSpeaking(false);
  }
}

async function getRealtimeToken() {
  if (OPENAI_TOKEN_ENDPOINT) {
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(OPENAI_TOKEN_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-realtime",
            voice: "marin",
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Realtime token endpoint failed with ${response.status}`);
        }

        const data = await response.json();
        clearTimeout(timeoutId);
        const token = data.client_secret?.value || data.value || data.client_secret;

        if (!token) {
          throw new Error("Realtime endpoint did not return an ephemeral client secret");
        }

        return token;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
      }
    }

    throw lastError || new Error("Realtime token request failed");
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
    await ensureFreshContext({ force: !hasUsefulLiveContext() });

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

    let stream = null;
    if (state.realtime.micEnabled && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.realtime.stream = stream;
        stream.getTracks().forEach((track) => {
          track.enabled = state.realtime.micEnabled;
          pc.addTrack(track, stream);
        });
      } catch (error) {
        if (error?.name === "NotFoundError" || /Requested device not found/i.test(String(error?.message || ""))) {
          state.realtime.micEnabled = false;
          state.realtime.stream = null;
        } else {
          throw error;
        }
      }
    }

    if (!stream) {
      pc.addTransceiver("audio", { direction: "recvonly" });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    let answerSdp = null;

    if (OPENAI_TOKEN_ENDPOINT) {
      answerSdp = await getRealtimeAnswerSdp(offer.sdp);
    } else {
      const token = await getRealtimeToken();
      const response = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        const rawError = await response.text();
        let detail = "";

        try {
          const parsed = JSON.parse(rawError);
          detail = parsed?.error?.message || rawError;
        } catch {
          detail = rawError;
        }

        throw new Error(getRealtimeSdpErrorMessage(detail));
      }

      answerSdp = await response.text();
    }

    const answer = {
      type: "answer",
      sdp: answerSdp,
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
    if (!state.realtime.micEnabled && !stream) {
      pushMessage("assistant", getMicFallbackMessage());
    }
    renderAssistant();

    if (state.assistantMode === "voice" && state.messages.length <= 1) {
      await sendTextToAssistant(
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
    pushMessage("assistant", normalizeRealtimeError(error));
    disconnectRealtime();
  } finally {
    state.realtime.connecting = false;
    renderAssistant();
  }
}

function disconnectRealtime() {
  const { micEnabled, voiceEnabled } = state.realtime;
  clearPendingVoiceResponseTimer();

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
    assistantSpeaking: false,
    pendingVoiceResponseTimer: null,
    handledAudioItems: {},
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
  if (!state.realtime.voiceEnabled) {
    setAssistantSpeaking(false);
  }
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
  schedulePersist();
  renderAssistant();
}

function buildAssistantInputText(userText) {
  const requestScopedContext = buildRequestScopedContext(userText);
  return `
${buildLiveContextSnapshot()}
${requestScopedContext ? `\n\n${requestScopedContext}` : ""}

TRAVELER REQUEST:
${String(userText || "").trim()}
  `.trim();
}

async function sendTextToAssistant(text) {
  if (!state.user) {
    return;
  }

  const clean = String(text || "").trim();
  if (!clean) {
    return;
  }

  await ensureFreshContext();
  await primeContextForRequest(clean);
  renderAll();
  updateRealtimeSession();
  pushMessage("user", clean);
  sendRealtimeEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: buildAssistantInputText(clean),
        },
      ],
    },
  });
  requestRealtimeResponseForTurn(clean);
}

async function askPlace(placeId) {
  const place = findPlace(placeId);
  if (!place) {
    return;
  }

  if (!state.realtime.connected) {
    await connectRealtime();
  }

  await sendTextToAssistant(
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
      openNow: item.openNow ?? null,
      routeSummary: String(item.routeSummary || t("routeNone")),
    }));
}

function sanitizeGeneratedPlan(plan) {
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.items)) {
    return null;
  }

  return {
    ...plan,
    name: String(plan.name || "").trim(),
    date: String(plan.date || ""),
    startTime: String(plan.startTime || ""),
    travelModeKey: String(plan.travelModeKey || ""),
    travelMode: String(plan.travelMode || ""),
    summary: String(plan.summary || ""),
    sourcePlaces: sanitizePlan(plan.sourcePlaces || []),
    items: plan.items
      .filter((item) => item && typeof item === "object" && item.placeId)
      .map((item) => ({
        ...item,
        placeId: String(item.placeId),
        name: String(item.name || ""),
        address: String(item.address || ""),
      })),
  };
}

function sanitizeSavedPlans(plans) {
  if (!Array.isArray(plans)) {
    return [];
  }

  return sortSavedPlans(
    plans
      .filter((plan) => plan && typeof plan === "object" && Array.isArray(plan.items))
      .map((plan) => ({
        ...sanitizeGeneratedPlan(plan),
        id: String(plan.id || `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        sourcePlaces: sanitizePlan(plan.sourcePlaces || []),
      }))
  );
}

function resetTravelerSession() {
  disconnectRealtime();
  state.user = null;
  state.authStatus = "unauthenticated";
  state.authMessage = "";
  state.authError = "";
  state.isAuthSubmitting = false;
  state.plan = [];
  state.generatedPlan = null;
  state.savedPlans = [];
  state.nearbyFilter = "all";
  state.nearbyFilterLoaded = {};
  state.memorySummary = DEFAULT_MEMORY_SUMMARY;
  state.contextUpdatedAt = 0;
  state.travelMode = DEFAULT_SETTINGS.travelMode;
  state.activeSection = "assistant";
  state.menuOpen = false;
  state.chatMenuOpen = false;
  state.planBuilderOpen = false;
  state.planWorkspace = "draft";
  state.expandedSavedPlanId = null;
  state.planDragId = null;
  state.suggestionVisible = false;
  state.confirmedLanguage = localStorage.getItem(LOCAL_LANGUAGE_KEY) || DEFAULT_SETTINGS.language;
  state.languageConfirmed =
    localStorage.getItem(LOCAL_LANGUAGE_CONFIRMED_KEY) === "1"
    || Boolean(localStorage.getItem(LOCAL_LANGUAGE_KEY));
  state.languageGateOpen = !state.languageConfirmed;
  state.accordions = {
    overview: true,
    map: false,
    nearby: false,
    plan: false,
  };
  state.realtime.micEnabled = DEFAULT_SETTINGS.micEnabled;
  state.realtime.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
  state.realtime.assistantSpeaking = false;
  state.assistantMode = DEFAULT_SETTINGS.assistantMode;
  setChats([createChat()]);
  localStorage.removeItem(LOCAL_PLAN_KEY);
  localStorage.removeItem(LOCAL_GENERATED_PLAN_KEY);
  localStorage.removeItem(LOCAL_SAVED_PLANS_KEY);
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
    state.assistantMode = stored.settings?.assistantMode === "text" ? "text" : DEFAULT_SETTINGS.assistantMode;
    state.realtime.voiceEnabled = state.assistantMode === "voice"
      ? stored.settings?.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled
      : false;
    state.realtime.assistantSpeaking = false;
    state.activeSection = "assistant";
    state.menuOpen = false;
    state.chatMenuOpen = false;
    state.planBuilderOpen = false;
    state.planWorkspace = "draft";
    state.expandedSavedPlanId = null;
    state.planDragId = null;
    state.suggestionVisible = false;
    state.plan = sanitizePlan(stored.plan ?? loadPlan());
    state.generatedPlan = sanitizeGeneratedPlan(stored.generatedPlan ?? loadGeneratedPlan());
    state.savedPlans = sanitizeSavedPlans(stored.savedPlans ?? loadSavedPlans());
    state.nearbyFilter = "all";
    state.nearbyFilterLoaded = {};
    setChats(stored.chats, stored.activeChatId);
    state.memorySummary = String(stored.memorySummary || "").trim() || buildTravelerMemory();
    state.contextUpdatedAt = 0;

    localStorage.setItem(LOCAL_LANGUAGE_KEY, state.language);
    savePlan();
    saveGeneratedPlan();
    saveSavedPlans();
    state.authStatus = "authenticated";
    schedulePersist();
  } catch (error) {
    console.error("Could not hydrate traveler state.", error);
    state.authStatus = "unauthenticated";
    state.authError = getAuthErrorMessage(error);
    state.user = null;
    state.savedPlans = [];
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
  state.chatMenuOpen = false;
  syncMessagesFromActiveChat();
  disconnectRealtime();
  schedulePersist();
  renderAll();
}

function deleteChat(chatId) {
  if (!state.chats.some((chat) => chat.id === chatId)) {
    return;
  }

  const remainingChats = state.chats.filter((chat) => chat.id !== chatId);
  const fallbackChats = remainingChats.length ? remainingChats : [createChat()];
  const nextActiveChatId = chatId === state.activeChatId ? fallbackChats[0].id : state.activeChatId;

  setChats(fallbackChats, nextActiveChatId);
  state.chatMenuOpen = false;
  disconnectRealtime();
  schedulePersist();
  renderAll();
}

function switchChat(chatId) {
  if (!state.chats.some((chat) => chat.id === chatId)) {
    return;
  }
  state.activeChatId = chatId;
  state.chatMenuOpen = false;
  syncMessagesFromActiveChat();
  disconnectRealtime();
  schedulePersist();
  renderAll();
}

async function refreshContext() {
  try {
    await loadGoogleMaps();
    await detectLocation();
    await reverseGeocode();
    await fetchWeather();
    if (state.maps.ready) {
      state.nearbyFilterLoaded = {};
      await loadNearbyPlaces();
      renderMarkers();
    }
  } catch (error) {
    console.error(error);
  }

  state.quickSuggestion = buildQuickSuggestion();
  state.contextUpdatedAt = Date.now();
  renderAll();
  if (state.realtime.connected) {
    updateRealtimeSession();
  }
}

function setMenuOpen(isOpen) {
  state.menuOpen = Boolean(isOpen);
  renderSectionPanels();
}

function refreshVisibleMap() {
  if (state.activeSection !== "map" || !state.maps.ready || !window.google?.maps) {
    return;
  }

  ensureMapView();
  els.mapCanvas.className = "";
  els.mapCanvas.textContent = "";

  window.setTimeout(() => {
    if (!state.maps.map) {
      return;
    }

    google.maps.event.trigger(state.maps.map, "resize");

    if (state.selectedPlaceId) {
      calculateRoute(state.selectedPlaceId).catch(() => {});
      return;
    }

    if (state.location?.coords) {
      renderMarkers();
      return;
    }

    state.maps.map.setCenter(DEFAULT_COORDS);
    state.maps.map.setZoom(13);
  }, 140);
}

function switchSection(section) {
  if (!["assistant", "map", "nearby", "plan"].includes(section)) {
    return;
  }
  state.activeSection = section;
  state.chatMenuOpen = false;
  renderSectionNav();
  renderSectionPanels();

  if (section === "assistant") {
    renderAssistant();
    renderThreads();
  }

  if (section === "map") {
    if (state.maps.ready) {
      renderMap();
      refreshVisibleMap();
    } else if (isConfigured(GOOGLE_API_KEY)) {
      loadGoogleMaps()
        .then(() => {
          renderMap();
          refreshVisibleMap();
        })
        .catch((error) => console.error(error));
    }
  }
}

function openLanguageSelector() {
  state.menuOpen = false;
  state.chatMenuOpen = false;
  state.languageGateOpen = true;
  renderAll();
  els.languageSelect.value = state.language;
}

async function requestInlineSuggestion() {
  if (!state.user) {
    return;
  }

  state.suggestionVisible = true;
  state.quickSuggestion = getSuggestionLoadingText();
  renderHero();

  if (!hasUsefulLiveContext()) {
    await refreshContext();
  }

  state.quickSuggestion = buildQuickSuggestion();
  renderHero();
}

function acceptInlineSuggestion() {
  addSuggestedPlacesToPlan(3);
  state.suggestionVisible = false;
  state.planWorkspace = "draft";
  switchSection("plan");
  renderAll();
}

function rejectInlineSuggestion() {
  state.suggestionVisible = false;
  renderHero();
}

function openPlanBuilder() {
  if (!state.plan.length) {
    return;
  }
  state.planWorkspace = "draft";
  els.planNameInput.value = state.generatedPlan?.name || "";
  els.planDateInput.value = state.generatedPlan?.date || getTodayIso();
  els.planStartTimeInput.value = state.generatedPlan?.startTime || "10:00";
  els.planTravelModeInput.value = state.generatedPlan?.travelModeKey || state.travelMode;
  state.planBuilderOpen = true;
  renderPlanBuilder();
}

function closePlanBuilder() {
  state.planBuilderOpen = false;
  renderPlanBuilder();
}

async function submitPlanBuilder() {
  const selectedTravelMode = els.planTravelModeInput.value || state.travelMode;
  state.travelMode = selectedTravelMode;
  const result = await buildTravelerPlan({
    name: els.planNameInput.value.trim(),
    date: els.planDateInput.value,
    startTime: els.planStartTimeInput.value,
    travelMode: selectedTravelMode,
  });

  if (result?.error) {
    pushMessage("assistant", result.error);
    closePlanBuilder();
    return;
  }

  closePlanBuilder();
  switchSection("plan");
  renderAll();
}

function startAutoContextRefresh() {
  if (contextRefreshInterval) {
    return;
  }

  contextRefreshInterval = window.setInterval(() => {
    refreshContext().catch((error) => console.error(error));
  }, 240000);
}

function bindEvents() {
  els.remoteAudio.addEventListener("playing", () => {
    if (state.realtime.voiceEnabled) {
      setAssistantSpeaking(true);
    }
  });
  ["pause", "ended", "waiting"].forEach((eventName) => {
    els.remoteAudio.addEventListener(eventName, () => {
      setAssistantSpeaking(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (state.chatMenuOpen && !event.target.closest("#chatMenu")) {
      state.chatMenuOpen = false;
      renderAssistant();
    }

    const sectionButton = event.target.closest("[data-section-switch]");
    if (sectionButton) {
      switchSection(sectionButton.dataset.sectionSwitch);
      return;
    }

    const accordionToggle = event.target.closest("[data-accordion-toggle]");
    if (accordionToggle) {
      const key = accordionToggle.dataset.accordionToggle;
      if (key && Object.prototype.hasOwnProperty.call(state.accordions, key)) {
        state.accordions[key] = !state.accordions[key];
        renderAccordionPanels();
      }
      return;
    }

    const chatButton = event.target.closest("[data-chat-id]");
    if (chatButton) {
      switchChat(chatButton.dataset.chatId);
      return;
    }

    const deleteChatButton = event.target.closest("[data-delete-chat]");
    if (deleteChatButton) {
      deleteChat(deleteChatButton.dataset.deleteChat);
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

    const nearbyFilterButton = event.target.closest("[data-nearby-filter]");
    if (nearbyFilterButton) {
      const nextFilter = nearbyFilterButton.dataset.nearbyFilter;
      if (nextFilter) {
        state.nearbyFilter = nextFilter;
        ensureNearbyFilterData(nextFilter).catch((error) => console.error(error));
        renderNearby();
      }
      return;
    }

    const planWorkspaceButton = event.target.closest("[data-plan-workspace]");
    if (planWorkspaceButton) {
      switchPlanWorkspace(planWorkspaceButton.dataset.planWorkspace);
      return;
    }

    const saveButton = event.target.closest("[data-save-place]");
    if (saveButton) {
      addPlaceToPlan(saveButton.dataset.savePlace);
      state.planWorkspace = "draft";
      switchSection("plan");
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
      switchSection("map");
      calculateRoute(routeButton.dataset.routePlace).catch(() => {});
      return;
    }

    const mapsButton = event.target.closest("[data-open-place]");
    if (mapsButton) {
      openPlaceInMaps(mapsButton.dataset.openPlace);
      return;
    }

    const generatedMapsButton = event.target.closest("[data-open-generated-place]");
    if (generatedMapsButton) {
      openPlaceInMaps(generatedMapsButton.dataset.openGeneratedPlace);
      return;
    }

    const savedPlanToggle = event.target.closest("[data-saved-plan-toggle]");
    if (savedPlanToggle) {
      toggleSavedPlan(savedPlanToggle.dataset.savedPlanToggle);
      return;
    }

    const editSavedPlanButton = event.target.closest("[data-edit-saved-plan]");
    if (editSavedPlanButton) {
      editSavedPlan(editSavedPlanButton.dataset.editSavedPlan);
      return;
    }

    const deleteSavedPlanButton = event.target.closest("[data-delete-saved-plan]");
    if (deleteSavedPlanButton) {
      deleteSavedPlan(deleteSavedPlanButton.dataset.deleteSavedPlan);
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
      return;
    }

    const assistantModeButton = event.target.closest("[data-assistant-mode]");
    if (assistantModeButton) {
      state.assistantMode = assistantModeButton.dataset.assistantMode === "text" ? "text" : "voice";
      state.realtime.voiceEnabled = state.assistantMode === "voice";
      if (state.assistantMode !== "voice") {
        setAssistantSpeaking(false);
      }
      if (state.realtime.connected) {
        updateRealtimeSession();
      }
      schedulePersist();
      renderAssistant();
      if (state.assistantMode === "text") {
        els.chatInput.focus();
      }
    }
  });

  els.menuToggleBtn.addEventListener("click", () => setMenuOpen(!state.menuOpen));
  els.menuCloseBtn.addEventListener("click", () => setMenuOpen(false));
  els.menuBackdrop.addEventListener("click", () => setMenuOpen(false));
  els.languageQuickBtn.addEventListener("click", openLanguageSelector);
  els.changeLanguageBtn.addEventListener("click", openLanguageSelector);
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
  els.suggestionBtn.addEventListener("click", () => requestInlineSuggestion().catch((error) => console.error(error)));
  els.acceptSuggestionBtn.addEventListener("click", acceptInlineSuggestion);
  els.rejectSuggestionBtn.addEventListener("click", rejectInlineSuggestion);
  els.locateBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.refreshBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.chatMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!state.user) {
      return;
    }
    state.chatMenuOpen = !state.chatMenuOpen;
    renderAssistant();
    renderThreads();
  });
  els.chatMenuNewBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    createNewChat();
  });
  els.connectBtn.addEventListener("click", () => connectRealtime().catch((error) => console.error(error)));
  els.disconnectBtn.addEventListener("click", disconnectRealtime);
  els.contextBtn.addEventListener("click", () => refreshContext().catch((error) => console.error(error)));
  els.micBtn.addEventListener("click", toggleMicrophone);
  els.voiceBtn.addEventListener("click", toggleVoice);
  els.voiceSessionBtn.addEventListener("click", () => {
    if (state.realtime.connected || state.realtime.connecting) {
      disconnectRealtime();
      return;
    }
    connectRealtime().catch((error) => console.error(error));
  });
  els.openPlanBuilderBtn.addEventListener("click", openPlanBuilder);
  els.planBuilderCloseBtn.addEventListener("click", closePlanBuilder);
  els.planBuilderCancelBtn.addEventListener("click", closePlanBuilder);
  els.planBuilderSheet.addEventListener("click", (event) => {
    if (event.target === els.planBuilderSheet) {
      closePlanBuilder();
    }
  });
  els.planBuilderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPlanBuilder().catch((error) => console.error(error));
  });
  els.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = els.chatInput.value.trim();
    if (!text || !state.user) {
      return;
    }
    if (!state.realtime.connected) {
      await connectRealtime();
    }
    await sendTextToAssistant(text);
    els.chatInput.value = "";
  });

  document.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-plan-drag]");
    if (!card) {
      return;
    }
    state.planDragId = card.dataset.planDrag;
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", state.planDragId);
  });

  document.addEventListener("dragover", (event) => {
    const card = event.target.closest("[data-plan-drag]");
    if (!card || !state.planDragId) {
      return;
    }
    event.preventDefault();
    card.classList.add("is-drag-over");
  });

  document.addEventListener("dragleave", (event) => {
    const card = event.target.closest("[data-plan-drag]");
    if (card) {
      card.classList.remove("is-drag-over");
    }
  });

  document.addEventListener("drop", (event) => {
    const card = event.target.closest("[data-plan-drag]");
    if (!card || !state.planDragId) {
      return;
    }
    event.preventDefault();
    card.classList.remove("is-drag-over");
    movePlanItem(state.planDragId, card.dataset.planDrag);
    state.planDragId = null;
  });

  document.addEventListener("dragend", () => {
    state.planDragId = null;
    document.querySelectorAll("[data-plan-drag]").forEach((card) => {
      card.classList.remove("is-dragging", "is-drag-over");
    });
  });
}

function boot() {
  setChats([createChat()]);
  bindEvents();
  renderAll();
  startAutoContextRefresh();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshContext().catch((error) => console.error(error));
    }
  });
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
