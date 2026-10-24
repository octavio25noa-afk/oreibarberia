/* =========================================================
   O Rei Barbearia — Lógica do site de agendamento
   Dados extraídos do Instagram @oreibarbearia e páginas oficiais
   ========================================================= */
"use strict";

/* ---------- Configuração da barbearia ---------- */
const SHOP = {
  name: "O Rei Barbearia",
  whatsapp: "5579998908960", // (79) 99890-8960 — link oficial da bio do Instagram
  address: "R. Edymêe de Azevedo Figueiredo, 3201 — Aracaju/SE",
  // Horários por dia da semana (0 = domingo … 6 = sábado)
  hours: {
    0: null,                                        // Domingo — fechado
    1: { open: "09:00", close: "20:00" },
    2: { open: "09:00", close: "20:00" },
    3: { open: "09:00", close: "20:00" },
    4: { open: "09:00", close: "20:00" },
    5: { open: "09:00", close: "20:00" },
    6: { open: "08:30", close: "18:00" },
  },
  slotStep: 30, // intervalo entre horários (minutos)
};

/* ---------- Serviços — tabela oficial de preços da barbearia ---------- */
const SERVICES = [
  // ---- Cabelo & Barba ----
  { id: "corte",      icon: "💈", name: "Corte Masculino",        desc: "Corte na máquina ou tesoura com acabamento de navalha.",       price: 50,  duration: 40,  group: "Cabelo & Barba" },
  { id: "barba",      icon: "🪒", name: "Barba",                  desc: "Modelagem e acabamento da barba com navalha.",                 price: 50,  duration: 30,  group: "Cabelo & Barba" },
  { id: "combo",      icon: "👑", name: "Corte e Barba",          desc: "O pacote completo para sair como rei.",                        price: 100, duration: 70,  group: "Cabelo & Barba", tag: "COMBO" },
  { id: "alinhamento",icon: "✂️", name: "Alinhamento de Fios",    desc: "Alinhamento premium de fios com acabamento detalhado.",        price: 120, minPrice: true, duration: 60, group: "Cabelo & Barba" },
  { id: "alinhamento-sc", icon: "🧵", name: "Alinhamento sem Corte", desc: "Só o alinhamento dos fios, sem corte.",                     price: 100, duration: 40,  group: "Cabelo & Barba" },
  { id: "coloracao",  icon: "🎨", name: "Coloração",              desc: "Coloração completa do cabelo.",                                price: 100, duration: 90,  group: "Cabelo & Barba" },
  { id: "luzes",      icon: "✨", name: "Luzes",                  desc: "Descoloração/mechas — valor define-se no atendimento.",        price: 200, minPrice: true, duration: 120, group: "Cabelo & Barba" },
  { id: "pigmentacao",icon: "🖌️", name: "Pigmentação de Barba",   desc: "Pigmentação para preencher e uniformizar a barba.",            price: 50,  duration: 40,  group: "Cabelo & Barba" },
  // ---- Rosto & Extras ----
  { id: "sobrancelha",icon: "👁️", name: "Sobrancelha",            desc: "Design e limpeza de sobrancelha na navalha.",                  price: 25,  duration: 15,  group: "Rosto & Extras" },
  { id: "hidratacao", icon: "💧", name: "Hidratação",             desc: "Hidratação capilar.",                                          price: 25,  duration: 30,  group: "Rosto & Extras" },
  { id: "hidratacao-pm", icon: "🧴", name: "Hidratação Paul Mitchell", desc: "Hidratação premium com linha Paul Mitchell.",             price: 40,  duration: 40,  group: "Rosto & Extras" },
  { id: "pezinho",    icon: "🦶", name: "Pezinho",                desc: "Acabamento rápido na borda do pé e navalhado.",                price: 20,  duration: 15,  group: "Rosto & Extras" },
  // ---- Mãos & Pés ----
  { id: "manicure",   icon: "💅", name: "Manicure",               desc: "Cuidado completo das unhas das mãos.",                         price: 35,  duration: 40,  group: "Mãos & Pés" },
  { id: "pedicure",   icon: "🧖", name: "Pedicure",               desc: "Cuidado completo das unhas dos pés.",                          price: 35,  duration: 50,  group: "Mãos & Pés" },
  { id: "mani-pedi",  icon: "🌟", name: "Manicure + Pedicure",    desc: "Os dois cuidados em um só horário.",                           price: 60,  duration: 90,  group: "Mãos & Pés" },
];

/* ---------- Barbeiros ---------- */
const BARBERS = [
  { id: "tiago",   name: "Tiago",   nickname: "O Mestre",  init: "T" },
  { id: "rafael",  name: "Rafael",  nickname: "Fade & Navalha", init: "R" },
  { id: "bruno",   name: "Bruno",   nickname: "Todos os estilos", init: "B" },
];

/* ---------- Estado ---------- */
const state = {
  step: 1,
  service: null,
  barber: null,
  date: null,   // "YYYY-MM-DD"
  time: null,   // "HH:MM"
  bookings: [],
};

const STEPS_TOTAL = 4;
const STORAGE_KEY = "oreibarbearia.bookings.v1";

/* ---------- Atalhos ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================================================
   Arte dos cards — ilustrações vetoriais exclusivas
   (geradas em runtime, tema preto + dourado, só homens)
   ========================================================= */
const ART = (() => {
  const G = "#d4af37", G2 = "#e8c968";

  /* moldura comum: fundo escuro, listras diagonais e brilho dourado */
  const wrap = (inner, extra = "") => `
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="abg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1d1d23"/><stop offset="1" stop-color="#0f0f12"/>
        </linearGradient>
        <radialGradient id="agl" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stop-color="${G}" stop-opacity=".18"/>
          <stop offset="1" stop-color="${G}" stop-opacity="0"/>
        </radialGradient>
        <pattern id="ast" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#ffffff" stroke-opacity=".04" stroke-width="3"/>
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#abg)"/>
      <rect width="800" height="450" fill="url(#ast)"/>
      <rect width="800" height="450" fill="url(#agl)"/>
      <g fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        ${inner}
      </g>
      ${extra}
      <rect x="10" y="10" width="780" height="430" rx="12" fill="none" stroke="${G}" stroke-opacity=".12" stroke-width="2"/>
    </svg>`;

  /* estrela de 4 pontas (brilho) */
  const star = (cx, cy, s, op = 1) =>
    `<path d="M${cx},${cy - s} L${cx + s * .22},${cy - s * .22} L${cx + s},${cy} L${cx + s * .22},${cy + s * .22} L${cx},${cy + s} L${cx - s * .22},${cy + s * .22} L${cx - s},${cy} L${cx - s * .22},${cy - s * .22} Z" fill="${G2}" stroke="none" opacity="${op}"/>`;

  /* onda suave (fio de cabelo) */
  const wave = (x, y, w, amp) =>
    `<path d="M${x},${y} c ${w * .25},${-amp} ${w * .5},${-amp} ${w * .5},0 c ${w * .05},${amp} ${w * .25},${amp} ${w * .5},0"/>`;

  /* pente: corpo retangular + dentes */
  const comb = (x, y, s = 1) =>
    `<g transform="translate(${x},${y}) scale(${s})">
      <rect x="0" y="0" width="210" height="34" rx="17"/>
      <path d="M175,34 v26"/>
      <path d="M160,34 v26"/>
      <path d="M145,34 v26"/>
      <path d="M130,34 v26"/>
      <path d="M115,34 v26"/>
      <path d="M100,34 v26"/>
      <path d="M85,34 v26"/>
      <path d="M70,34 v26"/>
      <path d="M55,34 v26"/>
      <path d="M40,34 v26"/>
      <path d="M25,34 v26"/>
    </g>`;

  /* navalha: lâmina + cabo, com ângulo */
  const razor = (x, y, ang = -40, s = 1) =>
    `<g transform="translate(${x},${y}) rotate(${ang}) scale(${s})">
      <rect x="-46" y="-98" width="180" height="26" rx="8"/>
      <path d="M-30,-85 h140" stroke-width="3"/>
      <rect x="-26" y="-66" width="170" height="30" rx="15"/>
      <circle cx="-46" cy="-52" r="7"/>
    </g>`;

  /* máquina de corte: corpo + dentes + arcos de movimento */
  const clipper = (x, y, s = 1) =>
    `<g transform="translate(${x},${y}) scale(${s})">
      <rect x="0" y="18" width="130" height="185" rx="20"/>
      <rect x="0" y="0" width="130" height="18" rx="9"/>
      <path d="M12,-4 v-22"/><path d="M26,-4 v-22"/><path d="M40,-4 v-22"/>
      <path d="M54,-4 v-22"/><path d="M68,-4 v-22"/><path d="M82,-4 v-22"/>
      <path d="M96,-4 v-22"/><path d="M110,-4 v-22"/><path d="M124,-4 v-22"/>
      <circle cx="65" cy="185" r="9"/>
      <path d="M175,40 a90,90 0 0 1 0,130"/>
      <path d="M205,55 a120,120 0 0 1 0,100"/>
    </g>`;

  const motifs = {
    /* máquina + fios ao vento */
    corte: wrap(`
      ${clipper(330, 150)}
      ${wave(110, 180, 150, 26)}
      ${wave(130, 215, 170, 32)}
      ${wave(150, 250, 150, 26)}
    `),

    /* navalha + barba pontilhada (fios gerados) */
    barba: wrap(`
      ${razor(430, 175, -40, 1)}
      <circle cx="330" cy="150" r="0.1" stroke="none"/>
      <path d="M255,295 a180,180 0 0 0 290,0" stroke-width="9" stroke-dasharray="0.5 20"/>
      <path d="M290,320 a140,140 0 0 0 220,0" stroke-width="9" stroke-dasharray="0.5 18"/>
      <path d="M325,345 a100,100 0 0 0 150,0" stroke-width="9" stroke-dasharray="0.5 16"/>
    `, star(610, 320, 18), star(180, 160, 13, .8)),

    /* coroa + poste de barbearia */
    combo: wrap(`
      <path d="M292,196 L327,124 L360,172 L400,98 L440,172 L473,124 L508,196 Z"/>
      <rect x="292" y="196" width="216" height="24" rx="6"/>
      <rect x="370" y="252" width="60" height="150" rx="26"/>
      <path d="M375,290 L425,268"/>
      <path d="M375,336 L425,314"/>
      <path d="M375,382 L425,360"/>
    `, `<circle cx="327" cy="112" r="7" fill="${G2}" stroke="none"/>
        <circle cx="400" cy="86"  r="7" fill="${G2}" stroke="none"/>
        <circle cx="473" cy="112" r="7" fill="${G2}" stroke="none"/>
        ${star(180, 140, 14, .8)} ${star(610, 150, 18)}`),

    /* pente + ondas de fios */
    alinhamento: wrap(`
      ${wave(360, 160, 300, 34)}
      ${wave(380, 205, 300, 30)}
      ${wave(400, 250, 300, 30)}
      ${wave(420, 295, 280, 26)}
    `, `${comb(150, 240, 0.9)} ${star(640, 130, 15, .9)}`),

    /* pente + fios retos alinhados */
    "alinhamento-sc": wrap(`
      <path d="M370,170 h280"/>
      <path d="M380,205 h290"/>
      <path d="M390,240 h280"/>
      <path d="M400,275 h270"/>
    `, `${comb(110, 220, 0.9)} ${star(620, 130, 15, .8)}`),

    /* tigela + pincel de tinta + gotas */
    coloracao: wrap(`
      <path d="M310,255 A85,85 0 0 0 480,255 Z"/>
      <g transform="translate(345,160) rotate(-28)">
        <rect x="0" y="-130" width="26" height="118" rx="13"/>
        <rect x="0" y="-16" width="26" height="34"/>
        <rect x="4" y="20" width="18" height="30" rx="5"/>
      </g>
    `, `<circle cx="505" cy="205" r="7" fill="${G2}" stroke="none"/>
        <circle cx="540" cy="175" r="5" fill="${G2}" stroke="none"/>
        ${star(240, 150, 16, .9)}`),

    /* raios de luz + fios */
    luzes: wrap(`
      ${wave(250, 185, 300, 30)}
      ${wave(270, 235, 300, 26)}
      ${wave(290, 280, 260, 22)}
    `, `
      ${star(560, 150, 26)} ${star(300, 130, 18, .85)} ${star(620, 240, 15, .7)} ${star(210, 290, 14, .6)}`),

    /* barba pontilhada no contorno do rosto + pincel */
    pigmentacao: wrap(`
      <circle cx="390" cy="205" r="95"/>
      <path d="M305,262 A95,95 0 0 0 475,262" stroke-width="10" stroke-dasharray="0.5 17"/>
      <path d="M325,285 A70,70 0 0 0 455,285" stroke-width="10" stroke-dasharray="0.5 15"/>
      <g transform="translate(545,140) rotate(35)">
        <rect x="0" y="0" width="24" height="110" rx="12"/>
        <rect x="2" y="-26" width="20" height="28" rx="6"/>
      </g>
    `, star(200, 120, 14, .8)),

    /* olho + sobrancelha + marcas de limpeza */
    sobrancelha: wrap(`
      <path d="M290,258 Q400,196 510,258"/>
      <path d="M290,258 Q400,302 510,258" stroke-width="5"/>
      <circle cx="400" cy="262" r="17"/>
      <path d="M305,222 Q400,168 495,222" stroke-width="13"/>
      <path d="M355,214 v-20" stroke-width="4"/>
      <path d="M400,206 v-20" stroke-width="4"/>
      <path d="M445,214 v-20" stroke-width="4"/>
    `, star(220, 160, 15, .85) + star(585, 320, 17)),

    /* gota + fios + brilhos */
    hidratacao: wrap(`
      <path d="M400,105 C 378,158 320,215 320,252 A 80,80 0 0 0 480,252 C 480,215 422,158 400,105 Z"/>
      <path d="M352,258 a 48,48 0 0 0 44,30" stroke-width="4"/>
      ${wave(520, 200, 180, 24)}
      ${wave(540, 245, 170, 20)}
      ${wave(105, 240, 150, 20)}
    `, star(610, 130, 16, .9) + star(160, 150, 13, .7)),

    /* frasco bomba + gotas */
    "hidratacao-pm": wrap(`
      <rect x="350" y="205" width="105" height="180" rx="18"/>
      <rect x="385" y="165" width="35" height="40"/>
      <rect x="385" y="120" width="35" height="45"/>
      <rect x="415" y="126" width="62" height="22" rx="11"/>
      <rect x="364" y="252" width="77" height="88" rx="8"/>
      <path d="M382,285 h44" stroke-width="4"/>
      <path d="M382,312 h44" stroke-width="4"/>
    `, `<circle cx="530" cy="250" r="7" fill="${G2}" stroke="none"/>
        <circle cx="565" cy="215" r="5" fill="${G2}" stroke="none"/>
        ${star(215, 170, 15, .85)}`),

    /* navalha precisão + linha limpa (pezinho) */
    pezinho: wrap(`
      ${razor(415, 200, -32, 0.85)}
      <path d="M230,330 h340" stroke-width="8"/>
      <path d="M230,300 h230" stroke-width="4" stroke-dasharray="0.5 16"/>
    `, star(590, 322, 16) + star(200, 180, 13, .7)),

    /* unhas + esmalte */
    manicure: wrap(`
      <rect x="300" y="228" width="132" height="106" rx="26"/>
      <rect x="308" y="152" width="26" height="78" rx="13"/>
      <rect x="340" y="146" width="26" height="84" rx="13"/>
      <rect x="372" y="144" width="26" height="86" rx="13"/>
      <rect x="404" y="148" width="26" height="82" rx="13"/>
      <rect x="560" y="252" width="56" height="74" rx="12"/>
      <rect x="574" y="216" width="28" height="36" rx="8"/>
      <path d="M588,216 v-24" stroke-width="6"/>
    `, `
      <rect x="315" y="158" width="12" height="14" rx="6" fill="${G2}" stroke="none"/>
      <rect x="347" y="152" width="12" height="14" rx="6" fill="${G2}" stroke="none"/>
      <rect x="379" y="150" width="12" height="14" rx="6" fill="${G2}" stroke="none"/>
      <rect x="411" y="154" width="12" height="14" rx="6" fill="${G2}" stroke="none"/>
      <circle cx="588" cy="240" r="9" fill="${G2}" stroke="none"/>
      ${star(650, 160, 15, .9)} ${star(230, 330, 13, .6)}`),

    /* dedos do pé + pincel de esmalte */
    pedicure: wrap(`
      <circle cx="395" cy="255" r="46"/>
      <circle cx="475" cy="285" r="24"/>
      <circle cx="520" cy="305" r="19"/>
      <circle cx="556" cy="325" r="15"/>
      <g transform="translate(330,160) rotate(-30)">
        <rect x="0" y="0" width="24" height="100" rx="12"/>
        <rect x="3" y="-24" width="18" height="26" rx="6" fill="${G2}" stroke="none"/>
      </g>
    `, star(630, 180, 16, .9) + star(240, 330, 13, .6)),

    /* mãos + pés juntos */
    "mani-pedi": wrap(`
      <rect x="230" y="230" width="118" height="100" rx="24"/>
      <rect x="238" y="160" width="24" height="72" rx="12"/>
      <rect x="268" y="156" width="24" height="76" rx="12"/>
      <rect x="298" y="154" width="24" height="78" rx="12"/>
      <circle cx="520" cy="300" r="40"/>
      <circle cx="588" cy="320" r="20"/>
      <path d="M560,205 v-30" stroke-width="6"/>
      <path d="M545,205 h30" stroke-width="6"/>
    `, `
      <rect x="244" y="166" width="11" height="13" rx="5" fill="${G2}" stroke="none"/>
      <rect x="274" y="162" width="11" height="13" rx="5" fill="${G2}" stroke="none"/>
      <rect x="304" y="160" width="11" height="13" rx="5" fill="${G2}" stroke="none"/>
      ${star(655, 200, 17, .9)} ${star(420, 130, 14, .7)}`),
  };

  const render = (id) => motifs[id] || motifs.corte;
  return { render };
})();

/* =========================================================
   Serviços e barbeiros na tela
   ========================================================= */
function renderServices() {
  const grid = $("#services-grid");
  const groups = ["Cabelo & Barba", "Rosto & Extras", "Mãos & Pés"];
  grid.innerHTML = groups.map((group) => {
    const items = SERVICES.filter((s) => s.group === group);
    if (!items.length) return "";
    return `
      <div class="group-row">
        <h3 class="group-title">${group}</h3>
        <div class="services">
          ${items.map((s) => `
            <article class="service-card">
              <div class="card-photo">
                ${ART.render(s.id)}
                <span class="photo-badge">${s.icon}</span>
              </div>
              ${s.tag ? `<span class="tag">★ ${s.tag}</span>` : ""}
              <h3>${s.name}</h3>
              <p>${s.desc}</p>
              <div class="meta">
                <span class="price">${s.minPrice ? "a partir de " : ""}R$ ${s.price},00</span>
                <span class="duration">⏱ ${s.duration} min</span>
              </div>
              <a class="btn-gold" href="#agendar" data-book-service="${s.id}">Agendar</a>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  // Atalho: clicar em "Agendar" dentro de um serviço escolhe-o direto
  grid.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-book-service]");
    if (!btn) return;
    state.service = SERVICES.find((s) => s.id === btn.dataset.bookService) || null;
    state.step = 2;
    refresh();
  });
}

function renderBookingServices() {
  const box = $("#booking-services");
  box.innerHTML = SERVICES.map((s) => cardHTML({
    selected: state.service && state.service.id === s.id,
    title: `${s.icon} ${s.name}`,
    sub: s.desc,
    price: `${s.minPrice ? "a partir de " : ""}R$ ${s.price},00 · ${s.duration} min`,
    dataset: `data-kind="service" data-id="${s.id}"`,
  })).join("");
}

function renderBarbers() {
  const box = $("#booking-barbers");
  box.innerHTML = BARBERS.map((b) => cardHTML({
    selected: state.barber && state.barber.id === b.id,
    avatar: b.init,
    title: `${b.name} <span class="sc-sub">· ${b.nickname}</span>`,
    sub: "Sujeito à agenda do dia",
    dataset: `data-kind="barber" data-id="${b.id}"`,
  })).join("");
}

function cardHTML({ selected, title, sub, price, avatar, dataset }) {
  return `
    <button type="button" class="select-card ${selected ? "selected" : ""}" ${dataset || ""}>
      ${avatar ? `<span class="sc-avatar">${avatar}</span>` : ""}
      <span class="sc-title">${title}</span>
      ${sub ? `<span class="sc-sub">${sub}</span>` : ""}
      ${price ? `<span class="sc-price">${price}</span>` : ""}
    </button>
  `;
}

/* =========================================================
   Horários disponíveis
   ========================================================= */
function dateISOToObj(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function objToISO(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function minutes(hhmm) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
function toHHMM(mins) { return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`; }

function isOpen(date) { return !!SHOP.hours[date.getDay()]; }

function availableSlots(dateISO) {
  const date = dateISOToObj(dateISO);
  const hours = SHOP.hours[date.getDay()];
  if (!hours) return [];

  const duration = state.service ? state.service.duration : 30;
  const slots = [];
  const now = new Date();
  const isToday = objToISO(now) === dateISO;

  for (let t = minutes(hours.open); t + duration <= minutes(hours.close); t += SHOP.slotStep) {
    const hhmm = toHHMM(t);
    if (isToday) {
      const slotDate = new Date(date);
      slotDate.setHours(Math.floor(t / 60), t % 60, 0, 0);
      if (slotDate <= now) continue; // já passou hoje
    }
    slots.push(hhmm);
  }
  return slots;
}

function renderSlots() {
  const box = $("#time-slots");
  const input = $("#booking-date");
  const note = $("#slot-note");

  if (!state.date) {
    box.innerHTML = `<p class="slots-empty">Escolha uma data para ver os horários.</p>`;
    note.style.display = "";
    return;
  }

  const dateObj = dateISOToObj(state.date);
  const weekday = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dateObj.getDay()];

  if (!isOpen(dateObj)) {
    box.innerHTML = `<p class="slots-empty">🚫 Não atendemos em ${weekday.toLowerCase()} — escolha outro dia.</p>`;
    return;
  }

  const slots = availableSlots(state.date);
  if (!slots.length) {
    box.innerHTML = `<p class="slots-empty">Não há horários livres neste dia. Escolha outra data.</p>`;
    return;
  }

  box.innerHTML = slots.map((t) => `
    <button type="button" class="slot ${state.time === t ? "selected" : ""}" data-time="${t}">${t}</button>
  `).join("");
}

/* =========================================================
   Wizard
   ========================================================= */
function canAdvance() {
  switch (state.step) {
    case 1: return !!state.service;
    case 2: return !!state.barber;
    case 3: return !!(state.date && state.time);
    case 4: {
      const name = $("#client-name").value.trim();
      const phone = $("#client-phone").value.trim();
      return name.length >= 2 && phone.replace(/\D/g, "").length >= 10;
    }
    default: return false;
  }
}

function goTo(step) {
  state.step = Math.min(Math.max(step, 1), STEPS_TOTAL);
  refresh();
}

function refresh() {
  /* — painéis — */
  for (let i = 1; i <= STEPS_TOTAL; i++) {
    $("#panel-" + i).classList.toggle("hidden", state.step !== i);
  }

  /* — indicador — */
  $$("#steps-indicator li").forEach((li) => {
    const n = Number(li.dataset.step);
    li.classList.toggle("active", n === state.step);
    li.classList.toggle("done", n < state.step);
  });

  /* — conteúdo dinâmico — */
  renderBookingServices();
  if (state.step === 2) renderBarbers();
  if (state.step === 3) renderSlots();
  updateSummary();

  /* — botões — */
  const next = $("#btn-next");
  const confirm = $("#btn-confirm");
  const prev = $("#btn-prev");
  prev.disabled = state.step === 1;
  prev.textContent = state.step === 1 ? "Voltar" : "Voltar";

  const ok = canAdvance();
  next.disabled = !ok;
  if (state.step === STEPS_TOTAL) {
    next.classList.add("hidden");
    confirm.classList.remove("hidden");
    confirm.disabled = !ok;
  } else {
    next.classList.remove("hidden");
    confirm.classList.add("hidden");
  }
}

function fmtDateBR(iso) {
  if (!iso) return "—";
  const d = dateISOToObj(iso);
  const weekday = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][d.getDay()];
  return `${weekday}, ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function updateSummary() {
  const set = (id, value) => {
    const el = $(id);
    el.textContent = value;
    el.classList.remove("waiting");
  };
  const w = () => { ["#sum-service", "#sum-barber", "#sum-date", "#sum-time", "#sum-price"].forEach((id) => { $(id).textContent = "—"; $(id).classList.add("waiting"); }); };

  if (state.service) set("#sum-service", state.service.name);
  if (state.barber) set("#sum-barber", state.barber.name);
  if (state.date) set("#sum-date", fmtDateBR(state.date));
  if (state.time) set("#sum-time", state.time);
  if (state.service) {
    const p = state.service.price;
    set("#sum-price", `${state.service.minPrice ? "a partir de " : ""}R$ ${p},00`);
  }
  if (!state.service) w();
}

/* =========================================================
   Confirmação e WhatsApp
   ========================================================= */
function whatsappLink(booking) {
  const lines = [
    `Olá! 👑 Gostaria de confirmar meu agendamento na ${SHOP.name}:`,
    ``,
    `💈 Serviço: ${booking.serviceName}${booking.minPrice ? " (a partir de)" : ""} — R$ ${booking.price},00`,
    `✂️ Barbeiro: ${booking.barberName}`,
    `📅 Data: ${booking.dateBR}`,
    `⏰ Hora: ${booking.time}`,
    `👤 Nome: ${booking.clientName}`,
    booking.notes ? `📝 Obs.: ${booking.notes}` : ``,
    ``,
    `Agendado pelo site de agendamento online.`,
  ];
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(lines.filter(Boolean).join("\n"))}`;
}

function confirmBooking() {
  const name = $("#client-name").value.trim();
  const phone = $("#client-phone").value.trim();
  const notes = $("#client-notes").value.trim();

  if (name.length < 2) { markInvalid("#client-name"); return; }
  if (phone.replace(/\D/g, "").length < 10) { markInvalid("#client-phone"); return; }

  const booking = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    serviceId: state.service.id,
    serviceName: state.service.name,
    price: state.service.price,
    minPrice: !!state.service.minPrice,
    barberId: state.barber.id,
    barberName: state.barber.name,
    date: state.date,
    dateBR: fmtDateBR(state.date),
    time: state.time,
    clientName: name,
    clientPhone: phone,
    notes,
  };

  state.bookings.push(booking);
  saveBookings();

  /* — tela de confirmação — */
  $("#wizard").classList.add("hidden");
  const box = $("#confirm-box");
  box.classList.remove("hidden");
  $("#confirm-details").innerHTML = `
    <span>Serviço</span><b>${booking.serviceName} — R$ ${booking.price},00</b>
    <span>Barbeiro</span><b>${booking.barberName}</b>
    <span>Data</span><b>${booking.dateBR}</b>
    <span>Hora</span><b>${booking.time}</b>
    <span>Cliente</span><b>${booking.clientName}</b>
  `;
  const wa = $("#btn-whatsapp");
  wa.href = whatsappLink(booking);
  $("#confirm-status").textContent =
    "Agendamento salvo neste navegador. Envie a confirmação pelo WhatsApp para garantir o horário.";

  renderBookings();
}

let lastErrorEl = null;
function markInvalid(sel) {
  const el = $(sel);
  el.classList.add("input-error");
  el.focus();
  if (lastErrorEl) { lastErrorEl.classList.remove("input-error"); }
  lastErrorEl = el;
}

/* =========================================================
   Meus agendamentos (persistidos no navegador)
   ========================================================= */
function saveBookings() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings)); } catch { /* sem storage */ }
}
function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.bookings = JSON.parse(raw) || [];
  } catch { state.bookings = []; }
}

function renderBookings() {
  const list = $("#bookings-list");
  const pending = state.bookings.slice().sort((a, b) => b.id - a.id);
  list.innerHTML = pending.length
    ? pending.map((b) => `
        <li>
          <div>
            <b>${b.date.split("-")[2]}/${b.date.split("-")[1]} · ${b.time}</b> — ${b.serviceName} (${b.barberName})<br>
            <small style="color:var(--muted)">${b.clientName}</small>
          </div>
          <button type="button" class="bk-remove" data-remove="${b.id}">Cancelar</button>
        </li>
      `).join("")
    : `<li style="justify-content:center;color:var(--muted)">Nenhum agendamento salvo ainda.</li>`;
}

/* =========================================================
   Eventos
   ========================================================= */
function wireEvents() {
  /* Seleção de serviço/barbeiro no wizard */
  ["#booking-services", "#booking-barbers"].forEach((sel) => {
    $(sel).addEventListener("click", (ev) => {
      const card = ev.target.closest(".select-card");
      if (!card) return;
      if (card.dataset.kind === "service") {
        state.service = SERVICES.find((s) => s.id === card.dataset.id);
      } else {
        state.barber = BARBERS.find((b) => b.id === card.dataset.id);
      }
      refresh();
    });
  });

  /* Data */
  $("#booking-date").addEventListener("change", (ev) => {
    state.date = ev.target.value || null;
    state.time = null; // muda o dia → limpa a hora
    refresh();
  });

  /* Hora */
  $("#time-slots").addEventListener("click", (ev) => {
    const slot = ev.target.closest(".slot");
    if (!slot || slot.disabled) return;
    state.time = slot.dataset.time;
    $("#booking-date").classList.remove("input-error");
    refresh();
  });

  /* Dados do cliente — revalidar a cada digitação */
  ["#client-name", "#client-phone", "#client-notes"].forEach((sel) => {
    $(sel).addEventListener("input", () => {
      $(sel).classList.remove("input-error");
      refresh(); // atualiza estado dos botões (validação de dados vive em canAdvance)
    });
  });

  /* Navegação */
  $("#btn-next").addEventListener("click", () => {
    if (!canAdvance()) return;
    goTo(state.step + 1);
    $("#agendar").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#btn-prev").addEventListener("click", () => goTo(state.step - 1));

  $("#btn-confirm").addEventListener("click", confirmBooking);

  /* Minha agenda */
  $("#toggle-bookings").addEventListener("click", () => {
    const list = $("#bookings-list");
    list.classList.toggle("hidden");
    renderBookings();
  });

  $("#bookings-list").addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove]");
    if (!btn) return;
    const id = Number(btn.dataset.remove);
    state.bookings = state.bookings.filter((b) => b.id !== id);
    saveBookings();
    renderBookings();
  });

  /* Limita a data: de hoje até ~30 dias à frente */
  const today = new Date();
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
  const dateInput = $("#booking-date");
  dateInput.min = objToISO(today);
  dateInput.max = objToISO(in30);
}

/* =========================================================
   Inicialização
   ========================================================= */
function init() {
  loadBookings();
  renderServices();
  wireEvents();
  renderBookings();
  refresh();
}

init();
