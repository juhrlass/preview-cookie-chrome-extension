export async function hostnameFromCurrentTab() {
    let queryResultHostname
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab?.url) {
        const url = new URL(tab.url);
        queryResultHostname = url.hostname
    }
    return queryResultHostname;
}