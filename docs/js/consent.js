import { getCookie, setCookie } from "/js/cookie.js";

const COOKIE_NAME = "anon_metrics_consent";
const GOATCOUNTER_SRC = "https://gc.zgo.at/count.js";
const GOATCOUNTER_ID = "https://kai5041.goatcounter.com/count";

let analyticsLoaded = false;

function getOverlay() {
    return document.getElementById("consent-overlay");
}

function showBanner() {
    const overlay = getOverlay();
    if (overlay) overlay.classList.add("is-visible");
}

function hideBanner() {
    const overlay = getOverlay();
    if (overlay) overlay.classList.remove("is-visible");
}

function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = GOATCOUNTER_SRC;
    script.setAttribute("data-goatcounter", GOATCOUNTER_ID);

    document.head.appendChild(script);
}

function saveConsent(value) {
    setCookie(COOKIE_NAME, value ? "true" : "false");
}

function handleChoice(accepted) {
    saveConsent(accepted);
    hideBanner();

    if (accepted) {
        loadAnalytics();
    }
}

function initConsent() {
    const enableBtn = document.getElementById("enable-analytics");
    const disableBtn = document.getElementById("disable-analytics");

    enableBtn?.addEventListener("click", () => handleChoice(true));
    disableBtn?.addEventListener("click", () => handleChoice(false));

    const consent = getCookie(COOKIE_NAME);

    if (consent === null || consent === undefined || consent === "") {
        showBanner();
        return;
    }

    hideBanner();

    if (consent === "true") {
        loadAnalytics();
    }
}

document.addEventListener("DOMContentLoaded", initConsent);

