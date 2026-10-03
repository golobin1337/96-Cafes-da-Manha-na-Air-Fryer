/* =========================================================
   Os links de checkout ficam direto no HTML (botões com data-checkout),
   assim funcionam antes mesmo deste arquivo carregar.
   Aqui só repassamos as UTMs da URL para o checkout.
   ========================================================= */
if (window.location.search) {
  document.querySelectorAll("[data-checkout]").forEach((btn) => {
    const url = btn.getAttribute("href");
    btn.href = url + (url.includes("?") ? "&" : "?") + window.location.search.slice(1);
  });
}

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

/* ---------- Embaralha os depoimentos a cada visita ----------
   Primeiro os prints sobre as receitas (.t-print), depois os de emagrecimento.
   A ordem dentro de cada grupo muda a cada visita. */
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
document.querySelectorAll(".carousel .car-track").forEach((track) => {
  const items = [...track.children];
  const recipes = shuffle(items.filter((el) => el.classList.contains("t-print")));
  const results = shuffle(items.filter((el) => !el.classList.contains("t-print")));
  [...recipes, ...results].forEach((item) => track.appendChild(item));
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

/* ---------- Barra fixa do Plano Completo ----------
   Só aparece depois que a pessoa passou (rolou para baixo) do botão de R$ 27,90. */
const stickyBuy = document.getElementById("stickyBuy");
const premiumBtn = document.getElementById("premiumBtn");
if (stickyBuy && premiumBtn) {
  const updateSticky = () => {
    const show = premiumBtn.getBoundingClientRect().bottom < 0;
    stickyBuy.classList.toggle("show", show);
    stickyBuy.setAttribute("aria-hidden", !show);
    stickyBuy.querySelector("a").tabIndex = show ? 0 : -1;
  };
  window.addEventListener("scroll", updateSticky, { passive: true });
  window.addEventListener("resize", updateSticky);
  updateSticky();
}
