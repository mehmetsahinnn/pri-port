// localStorage can throw (private mode, blocked site data); never let that break the page.

export function getItem(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function setItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Preference just won't persist.
    }
}
