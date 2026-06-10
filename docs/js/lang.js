document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".lang-overlay");
  const trigger = document.querySelector(".lang-selector");
  const buttons = document.querySelectorAll("[data-lang]");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    wrapper.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove("open");
    }
  });



  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;

      const parts = window.location.pathname.split("/");
      parts[1] = lang;

      window.location.pathname = parts.join("/");
    });
  });
});

