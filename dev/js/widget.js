function setJapaneseDate() {
  const el = document.getElementById("date");
  if (!el) return;

  const now = new Date();

  const formatted = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(now);

  el.textContent = formatted;
}

document.addEventListener("DOMContentLoaded", setJapaneseDate);
