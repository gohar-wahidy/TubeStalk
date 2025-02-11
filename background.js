chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableCamera" || message.action === "disableCamera") {
        // Send the message to the content script running on the active tab
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

// Helper function to forward message to content script
function forwardMessageToContentScript(message) {
    window.postMessage({ action: message.action }, "*");
}
