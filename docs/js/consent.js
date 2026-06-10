import { getCookie, setCookie } from "/js/cookie.js";

const COOKIE_NAME = "anon_metrics_consent";
const GOATCOUNTER_SRC = "https://gc.zgo.at/count.js";
const GOATCOUNTER_ID = "https://kai5041.goatcounter.com/count";

function hasAnonymousMetricsConsent() {
    return getCookie(COOKIE_NAME) === "true";
}

function loadAnalytics() {
    if (window.__goatcounter_loaded) return;
    window.__goatcounter_loaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = GOATCOUNTER_SRC;
    script.setAttribute("data-goatcounter", GOATCOUNTER_ID);

    document.head.appendChild(script);
}

function hideBanner() {
    const overlay = document.getElementById("consent-overlay");
    if (overlay) overlay.style.display = "none";
}

function applyConsent(accepted) {
    hideBanner();

    if (accepted) {
        loadAnalytics();
    }
}

function setAnonymousMetricsConsent(accepted) {
    setCookie(COOKIE_NAME, accepted ? "true" : "false");
    applyConsent(accepted);
}

function initConsent() {
    const enableBtn = document.getElementById("enable-analytics");
    const disableBtn = document.getElementById("disable-analytics");

    if (enableBtn) {
        enableBtn.addEventListener("click", () => {
            setAnonymousMetricsConsent(true);
        });
    }

    if (disableBtn) {
        disableBtn.addEventListener("click", () => {
            setAnonymousMetricsConsent(false);
        });
    }

    if (getCookie(COOKIE_NAME)) {
        hideBanner();

        if (hasAnonymousMetricsConsent()) {
            loadAnalytics();
        }
    }
}

document.addEventListener("DOMContentLoaded", initConsent);

