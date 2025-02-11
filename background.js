chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableCamera" || message.action === "disableCamera") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: forwardMessageToContentScript,
                    args: [message]
                });
            }
        });
    }
});

function forwardMessageToContentScript(message) {
    window.postMessage({ action: message.action }, "*");
}
