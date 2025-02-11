document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("enabled", (data) => {
        if (data.enabled === undefined) {
            chrome.storage.local.set({ enabled: false }); // Default to disabled on install
        }
    });

    document.getElementById("enable").addEventListener("click", () => {
        chrome.storage.local.set({ enabled: true });
        chrome.runtime.sendMessage({ action: "enableCamera" });
    });

    document.getElementById("disable").addEventListener("click", () => {
        chrome.storage.local.set({ enabled: false });
        chrome.runtime.sendMessage({ action: "disableCamera" });
    });
});
