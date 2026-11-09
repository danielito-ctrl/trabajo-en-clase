/* ====== CONFIGURACIÓN: edita aquí ====== */
const WHATSAPP = "573000000000"; // Tu número con código de país, sin + ni espacios
const MONEDA = "COP";

// Productos: cambia nombres, precios y descripciones.
// c1 = color principal, c2 = color de detalles, c3 = color del cuello/mangas
const PRODUCTOS = [
  { id: 1, nombre: "Camiseta Local 2026", tipo: "Local", precio: 289000, tag: "Nueva",
    desc: "Azul profundo con detalles blancos. Corte para hincha.", c1: "#0b3a9e", c2: "#ffffff", c3: "#ffffff" },
  { id: 2, nombre: "Camiseta Visitante 2026", tipo: "Visitante", precio: 289000, tag: "",
    desc: "Blanca con franja azul. Tela liviana y transpirable.", c1: "#f4f6fb", c2: "#0b3a9e", c3: "#0b3a9e" },
  { id: 3, nombre: "Camiseta Alterna", tipo: "Visitante", precio: 269000, tag: "",
    desc: "Negra con toques dorados. Edición para las noches de estadio.", c1: "#10131c", c2: "#e3b341", c3: "#e3b341" },
  { id: 4, nombre: "Camiseta de Entrenamiento", tipo: "Entrenamiento", precio: 179000, tag: "Más vendida",
    desc: "Ligera y de secado rápido. Ideal para el gimnasio y el día a día.", c1: "#2f7bff", c2: "#07142e", c3: "#07142e" },
  { id: 5, nombre: "Camiseta Retro Campeón", tipo: "Retro", precio: 249000, tag: "Edición limitada",
    desc: "Inspirada en las camisetas clásicas del Embajador.", c1: "#123a8f", c2: "#ffffff", c3: "#e3b341" },
  { id: 6, nombre: "Camiseta Niño Local", tipo: "Niños", precio: 199000, tag: "",
    desc: "Misma camiseta de papá y mamá, en tallas para niños.", c1: "#0b3a9e", c2: "#ffffff", c3: "#ffffff", tallas: ["6", "8", "10", "12", "14"] }
];
const TALLAS = ["S", "M", "L", "XL", "XXL"];
/* ======================================= */

const $ = (s) => document.querySelector(s);
const fmt = (n) => "$" + n.toLocaleString("es-CO");
let carrito = JSON.parse(sessionStorage.getItem("carrito") || "[]");
let filtro = "Todas";
const tallaSel = {};

function camisetaSVG(p) {
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${p.nombre}">
    <path d="M70 20 L20 48 L36 90 L58 80 L58 180 L142 180 L142 80 L164 90 L180 48 L130 20 Q100 44 70 20Z" fill="${p.c1}" stroke="rgba(0,0,0,.18)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M70 20 Q100 44 130 20 L124 18 Q100 34 76 18Z" fill="${p.c3}"/>
    <path d="M20 48 L36 90 L58 80 L48 40Z M180 48 L164 90 L142 80 L152 40Z" fill="${p.c3}" opacity=".9"/>
    <rect x="58" y="110" width="84" height="14" fill="${p.c2}" opacity=".9"/>
    <circle cx="100" cy="76" r="9" fill="${p.c2}"/>
  </svg>`;
}

function pintarFiltros() {
  const tipos = ["Todas", ...new Set(PRODUCTOS.map((p) => p.tipo))];
  $("#filters").innerHTML = tipos.map((t) => `<button class="chip ${t === filtro ? "on" : ""}" data-t="${t}">${t}</button>`).join("");
}

function pintarProductos() {
  const lista = PRODUCTOS.filter((p) => filtro === "Todas" || p.tipo === filtro);
  $("#grid").innerHTML = lista.map((p) => {
    const tallas = p.tallas || TALLAS;
    const sel = tallaSel[p.id] || tallas[1] || tallas[0];
    tallaSel[p.id] = sel;
    return `<article class="card">
      <div class="card-img">${p.tag ? `<span class="tag">${p.tag}</span>` : ""}${camisetaSVG(p)}</div>
      <div class="card-body">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.desc}</p>
        <p class="price">${fmt(p.precio)} ${MONEDA}</p>
        <div class="sizes" role="group" aria-label="Talla">
          ${tallas.map((t) => `<button class="size ${t === sel ? "on" : ""}" data-id="${p.id}" data-talla="${t}">${t}</button>`).join("")}
        </div>
        <button class="add" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>`;
  }).join("");
}

function guardar() { sessionStorage.setItem("carrito", JSON.stringify(carrito)); }

function pintarCarrito() {
  const total = carrito.reduce((s, i) => s + i.precio * i.cant, 0);
  const cant = carrito.reduce((s, i) => s + i.cant, 0);
  $("#cartCount").textContent = cant;
  $("#cartTotal").textContent = fmt(total);
  $("#checkout").disabled = !carrito.length;
  $("#cartItems").innerHTML = carrito.length
    ? carrito.map((i, k) => `<li class="line">
        <div><b>${i.nombre}</b><div class="meta">Talla ${i.talla} · ${fmt(i.precio)}</div></div>
        <div class="qty"><button data-k="${k}" data-d="-1" aria-label="Quitar uno">−</button><span>${i.cant}</span><button data-k="${k}" data-d="1" aria-label="Agregar uno">+</button></div>
        <button class="rm" data-rm="${k}">Eliminar</button>
      </li>`).join("")
    : `<li class="empty">Tu carrito está vacío. Elige una camiseta y una talla.</li>`;
}

function abrir(v) {
  $("#drawer").classList.toggle("open", v);
  $("#overlay").classList.toggle("show", v);
  $("#drawer").setAttribute("aria-hidden", !v);
}

function aviso(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function agregar(id) {
  const p = PRODUCTOS.find((x) => x.id === id);
  const talla = tallaSel[id];
  const ex = carrito.find((i) => i.id === id && i.talla === talla);
  ex ? ex.cant++ : carrito.push({ id, nombre: p.nombre, precio: p.precio, talla, cant: 1 });
  guardar(); pintarCarrito();
  aviso(`${p.nombre} (talla ${talla}) agregada`);
}

function pedir() {
  const nombre = $("#clientName").value.trim() || "Cliente";
  const total = carrito.reduce((s, i) => s + i.precio * i.cant, 0);
  const lineas = carrito.map((i) => `• ${i.cant} x ${i.nombre} (talla ${i.talla}) - ${fmt(i.precio * i.cant)}`).join("\n");
  const msg = `Hola, soy ${nombre}. Quiero hacer este pedido:\n\n${lineas}\n\nTotal: ${fmt(total)} ${MONEDA}\n\n¿Me confirman disponibilidad y envío?`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.t) { filtro = t.dataset.t; pintarFiltros(); pintarProductos(); }
  else if (t.dataset.talla) { tallaSel[t.dataset.id] = t.dataset.talla; pintarProductos(); }
  else if (t.dataset.add) agregar(Number(t.dataset.add));
  else if (t.dataset.d) {
    const i = carrito[t.dataset.k]; i.cant += Number(t.dataset.d);
    if (i.cant < 1) carrito.splice(t.dataset.k, 1);
    guardar(); pintarCarrito();
  }
  else if (t.dataset.rm) { carrito.splice(t.dataset.rm, 1); guardar(); pintarCarrito(); }
});
$("#openCart").onclick = () => abrir(true);
$("#closeCart").onclick = () => abrir(false);
$("#overlay").onclick = () => abrir(false);
document.addEventListener("keydown", (e) => e.key === "Escape" && abrir(false));
$("#checkout").onclick = pedir;

$("#heroArt").innerHTML = camisetaSVG(PRODUCTOS[0]);
$("#year").textContent = new Date().getFullYear();
pintarFiltros(); pintarProductos(); pintarCarrito();
