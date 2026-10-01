/* =========================================================
   CONFIGURAÇÃO — cole aqui os links de checkout da sua plataforma
   (Kiwify, Hotmart, Eduzz, Cakto etc.)
   ========================================================= */
const CHECKOUT = {
  basico: "https://mundoconhecimento.mycartpanda.com/checkout/210975167:1",
  premium: "https://mundoconhecimento.mycartpanda.com/checkout/211727235:1",
};

/* Repassa UTMs e outros parâmetros da URL para o checkout,
   para não perder o rastreamento das campanhas. */
function withUrlParams(url) {
  const params = window.location.search;
  if (!params) return url;
  return url + (url.includes("?") ? "&" : "?") + params.slice(1);
}

/* ---------- Links de checkout ---------- */
document.querySelectorAll("[data-checkout]").forEach((btn) => {
  const url = CHECKOUT[btn.dataset.checkout];
  if (url) btn.href = withUrlParams(url);
});

/* ---------- Imagens: remove a <img> se o arquivo não existir,
   deixando o placeholder visível ---------- */
document.querySelectorAll(".hero-img img, .recipe img, .t-photo img").forEach((img) => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop();
  else img.addEventListener("error", drop);
});

/* ---------- FAQ: abre uma pergunta por vez ---------- */
const faqItems = document.querySelectorAll(".faq details");
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

/* ---------- Animação de entrada ao rolar ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* ---------- Faixa do topo: mostra sempre a data de hoje ---------- */
const todayDate = document.getElementById("todayDate");
if (todayDate) {
  todayDate.textContent = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

/* Garante que a faixa fixa não cubra o início da página, mesmo se quebrar em 2 linhas */
const topbar = document.querySelector(".topbar");
function fitTopbar() {
  if (!topbar) return;
  const h = topbar.offsetHeight;
  document.body.style.paddingTop = h + "px";
  document.documentElement.style.scrollPaddingTop = h + 12 + "px";
}
window.addEventListener("resize", fitTopbar);
fitTopbar();

/* ---------- Embaralha os depoimentos a cada visita ---------- */
document.querySelectorAll(".carousel .car-track").forEach((track) => {
  const items = [...track.children];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((item) => track.appendChild(item));
});

/* ---------- Carrossel de depoimentos ---------- */
document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".car-track");
  const slides = [...track.children];
  const dotsBox = carousel.querySelector(".car-dots");
  const DELAY = 4000; // tempo de cada depoimento na tela (ms)
  let current = 0;
  let timer;

  const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsBox.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.scrollTo({ left: current * step(), behavior: "smooth" });
    markActive();
  }

  function markActive() {
    dots.forEach((d, i) => d.setAttribute("aria-selected", i === current));
  }

  // Atualiza a bolinha ativa quando a pessoa arrasta com o dedo
  track.addEventListener("scroll", () => {
    current = Math.min(slides.length - 1, Math.round(track.scrollLeft / step()));
    markActive();
  }, { passive: true });

  carousel.querySelector(".prev").addEventListener("click", () => { goTo(current - 1); restart(); });
  carousel.querySelector(".next").addEventListener("click", () => { goTo(current + 1); restart(); });

  // Passa sozinho; depois que a pessoa arrasta ou clica, recomeça a contagem
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
  }
  track.addEventListener("touchstart", () => clearInterval(timer), { passive: true });
  track.addEventListener("touchend", restart);

  markActive();
  restart();
});
