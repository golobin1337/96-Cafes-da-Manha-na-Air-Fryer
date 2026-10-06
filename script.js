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

/* ---------- Depoimentos: receitas primeiro, emagrecimento depois ----------
   A ordem dentro de cada grupo muda a cada visita. */
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
const quotesTrack = document.querySelector("#quotesCarousel .car-track");
if (quotesTrack) {
  const items = [...quotesTrack.children];
  const recipes = shuffle(items.filter((el) => el.classList.contains("t-print")));
  const results = shuffle(items.filter((el) => !el.classList.contains("t-print")));
  [...recipes, ...results].forEach((item) => quotesTrack.appendChild(item));
}

/* ---------- Carrosséis (receitas e depoimentos) ----------
   Funciona com 1 ou vários itens visíveis por vez; passa sozinho. */
document.querySelectorAll(".carousel").forEach((carousel) => {
  const track = carousel.querySelector(".car-track");
  const slides = [...track.children];
  const dotsBox = carousel.querySelector(".car-dots");
  const DELAY = 3500; // tempo de cada passo (ms)
  let current = 0;
  let positions = 1;
  let dots = [];
  let timer;

  const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth) || 1;

  // Quantas paradas existem (depende de quantos itens cabem na tela)
  function buildDots() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    positions = Math.max(1, Math.round(maxScroll / step()) + 1);
    dotsBox.innerHTML = "";
    dots = Array.from({ length: positions }, (_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Ir para a posição " + (i + 1));
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dotsBox.appendChild(dot);
      return dot;
    });
    current = Math.min(current, positions - 1);
    carousel.classList.toggle("static", positions <= 1);
    markActive();
  }

  function goTo(i) {
    current = (i + positions) % positions;
    track.scrollTo({ left: current * step(), behavior: "smooth" });
    markActive();
  }

  function markActive() {
    dots.forEach((d, i) => d.setAttribute("aria-selected", i === current));
  }

  // Atualiza a bolinha ativa quando a pessoa arrasta com o dedo
  track.addEventListener("scroll", () => {
    current = Math.min(positions - 1, Math.round(track.scrollLeft / step()));
    markActive();
  }, { passive: true });

  carousel.querySelector(".prev").addEventListener("click", () => { goTo(current - 1); restart(); });
  carousel.querySelector(".next").addEventListener("click", () => { goTo(current + 1); restart(); });

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DELAY);
  }
  track.addEventListener("touchstart", () => clearInterval(timer), { passive: true });
  track.addEventListener("touchend", restart);
  window.addEventListener("resize", buildDots);
  window.addEventListener("load", buildDots); // recalcula quando o CSS completo terminar de carregar

  buildDots();
  restart();
});

/* ---------- Barra fixa do Plano Premium ----------
   Só aparece depois que a pessoa passou (rolou para baixo) do botão do Premium. */
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

/* ---------- Popup de redirect ----------
   Ao clicar em "Quero o plano básico", mostra a oferta do Completo por R$ 19,90.
   A pessoa pode aceitar ou seguir para o Básico de R$ 14,90. */
const upsell = document.getElementById("upsell");
const basicBtn = document.querySelector('.plan.basic [data-checkout="basico"]');
if (upsell && basicBtn) {
  const openUpsell = (e) => {
    e.preventDefault();
    upsell.hidden = false;
    document.body.classList.add("no-scroll");
    upsell.querySelector(".up-yes").focus();
  };
  const closeUpsell = () => {
    upsell.hidden = true;
    document.body.classList.remove("no-scroll");
    basicBtn.focus();
  };
  basicBtn.addEventListener("click", openUpsell);
  upsell.querySelector(".up-close").addEventListener("click", closeUpsell);
  upsell.addEventListener("click", (e) => { if (e.target === upsell) closeUpsell(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !upsell.hidden) closeUpsell(); });
}
