export const PAVILIONS = [
  {
    id: 1,
    name: "El desierto y su pasado",
    desc: "Paleontologia y dinosaurios",
    color: "orange",
    icon: "\uD83E\uDD96",
    scannerTargetSrc: "./assets/ar/targets/targets.mind",
    scannerModelSrc: "./assets/ar/models/modelo.glb",
    viewerModelSrc: "./assets/ar/models/modelo.glb",
    viewerIosSrc: "./assets/ar/models/modelo2.usdz",
  },
  {
    id: 5,
    name: "El vino y su historia",
    desc: "Tradicion vitivinicola del desierto",
    color: "wine",
    icon: "\uD83C\uDF47",
    scannerTargetSrc: "./assets/ar/targets/targetsm.mind",
    scannerModelSrc: "./assets/ar/models/modelom.glb",
    viewerModelSrc: "./assets/ar/models/modelom.glb",
    viewerIosSrc: "./assets/ar/models/modelom.usdz",
    mapUrl: "https://maps.app.goo.gl/Ri9Jo9KK3viNGTTZ8",
  },
  {
    id: 2,
    name: "El hombre y el desierto",
    desc: "Historia y petrograbados",
    color: "ochre",
    icon: "\uD83C\uDFDC\uFE0F",
  },
  {
    id: 3,
    name: "Evolucion y biodiversidad",
    desc: "Megafauna de la Era de Hielo",
    color: "blue",
    icon: "\uD83E\uDDA3",
  },
  {
    id: 4,
    name: "Ecosistemas",
    desc: "Laboratorios de la vida viva",
    color: "green",
    icon: "\uD83C\uDF35",
  },
];

export const PRODUCTS = [
  { id: "t_adult", name: "Entrada Adulto", price: 245, type: "ticket" },
  { id: "t_child", name: "Entrada Nino (4-12)", price: 160, type: "ticket" },
  {
    id: "t_fam",
    name: "Paquete Familiar (2A+2N)",
    price: 650,
    type: "ticket",
  },
  { id: "s_tour", name: "Tour Guiado Premium", price: 150, type: "service" },
  { id: "f_combo", name: "Combo Cafeteria Dino", price: 120, type: "food" },
];
