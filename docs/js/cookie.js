export function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    const parts = [
        `${name}=${value}`,
        `expires=${expires.toUTCString()}`,
        `path=/`,
        `SameSite=Lax`
    ];

    if (location.protocol === "https:") {
        parts.push("Secure");
    }

    document.cookie = parts.join("; ");
}

export function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1];
}

