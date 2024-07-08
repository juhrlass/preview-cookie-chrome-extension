export async function protocolAndHostnameFromCurrentTab() {
    let protocolAndHostname
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab?.url) {
        const url = new URL(tab.url);
        protocolAndHostname = url.protocol+"//"+url.hostname
    }
    return protocolAndHostname;
}