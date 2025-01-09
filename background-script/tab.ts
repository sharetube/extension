import { BackgroundMessagingClient } from "./clients/ExtensionClient";
import ServerClient from "./clients/ServerClient";
import { ProfileStorage } from "./profileStorage";
import { globalState } from "./state";
import { TabStorage } from "./tabStorage";
import { setTargetPrimaryTabId } from "./targetPrimaryTabId";
import { ExtensionMessageType } from "types/extensionMessage";

const server = ServerClient.getInstance();
const tabStorage = TabStorage.getInstance();
const bgMessagingClient = BackgroundMessagingClient.getInstance();
const profileStorage = ProfileStorage.getInstance();

const domainRegex = /^https:\/\/(www\.)?(youtu\.be|youtube\.com)/;
const inviteLinkRegex = /^https:\/\/(www\.)?youtu\.be\/st\/(.+)$/;
const roomIdRegex = /^[a-zA-Z0-9.-]{8}$/;

const handleTab = async (tabId: number, url: string) => {
    const inviteLinkMatch = url.match(inviteLinkRegex);
    console.log("inviteLinkMatch", inviteLinkMatch);
    if (!inviteLinkMatch) return;

    const showErrorPage = () => {
        chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL("/pages/error.html"),
        });
    };

    const roomId = inviteLinkMatch[2];
    const roomIdMatch = roomId.match(roomIdRegex);
    console.log("roomIdMatch", roomIdMatch);
    if (!roomIdMatch) {
        showErrorPage();
        return;
    }

    const primaryTabId = await tabStorage.getPrimaryTab();
    if (primaryTabId) {
        if (primaryTabId === tabId) {
            server.close();

            setTargetPrimaryTabId(tabId);
            const profile = await profileStorage.get();
            server.joinRoom(profile, roomId).catch(() => {
                showErrorPage();
            });
        } else {
            chrome.tabs.update(primaryTabId, { active: true });
            chrome.tabs.remove(tabId);
        }
    } else {
        const profile = await profileStorage.get();

        setTargetPrimaryTabId(tabId);
        // show loading screen
        chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL("/pages/loading.html"),
        });

        server.joinRoom(profile, roomId).catch(() => {
            showErrorPage();
        });
    }
};

async function clearPrimaryTab() {
    server.close();
    await tabStorage.unsetPrimaryTab();
    bgMessagingClient.broadcastMessage(ExtensionMessageType.PRIMARY_TAB_UNSET);
}

export async function getPrimaryTabIdOrUnset(): Promise<number | null> {
    const primaryTabId = await tabStorage.getPrimaryTab();
    if (!primaryTabId) return null;

    return new Promise(resolve => {
        chrome.tabs
            .get(primaryTabId)
            .then(() => resolve(primaryTabId))
            .catch(async () => {
                tabStorage.removeTab(primaryTabId);
                await clearPrimaryTab();
                resolve(null);
            });
    });
}

chrome.webNavigation.onBeforeNavigate.addListener(
    details => {
        if (details.url) handleTab(details.tabId, details.url);
    },
    { url: [{ hostSuffix: "youtu.be" }] },
);

chrome.tabs.onRemoved.addListener(async tabId => {
    console.log("tab removed", tabId);
    getPrimaryTabIdOrUnset();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
        return;
    }

    const primaryTabId = await getPrimaryTabIdOrUnset();
    if (primaryTabId !== tabId) {
        return;
    }
    console.log("tab updated", tabId, primaryTabId, changeInfo.url);

    if (!tab.url?.match(domainRegex)) {
        clearPrimaryTab();
        return;
    }

    if (
        changeInfo.url !== `https://www.youtube.com/watch?v=${globalState.room.player.video_url}` &&
        changeInfo.url !==
            `https://www.youtube.com/watch?v=${globalState.room.player.video_url}&t=0`
    ) {
        clearPrimaryTab();
    }
});
