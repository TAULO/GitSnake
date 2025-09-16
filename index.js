const timeoutInMilliseconds = 500;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.querySelector("button").addEventListener("click", async (e) => {
    for (let i = 3; i > 0; i--) {
        e.target.innerText = i;
        await sleep(timeoutInMilliseconds);
    }

    e.target.innerText = 'GO!'

    await sleep(timeoutInMilliseconds);

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    function sendWhenReady(tabId, message) {
        // Check if tab is already complete
        chrome.tabs.get(tabId, (tabInfo) => {
            if (tabInfo.status === "complete") {
                chrome.tabs.sendMessage(tabId, message);
            } else {
                // Wait for tab to finish loading
                function listener(updatedTabId, changeInfo, updatedTab) {
                    if (updatedTabId === tabId && changeInfo.status === "complete") {
                        chrome.tabs.sendMessage(tabId, message);
                        chrome.tabs.onUpdated.removeListener(listener);
                    }
                }
                chrome.tabs.onUpdated.addListener(listener);
            }
        });
    }

    sendWhenReady(tab.id, { gameStarted: true });
    window.close();
});