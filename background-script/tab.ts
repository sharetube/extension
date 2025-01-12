import { BackgroundMessagingClient } from "./clients/ExtensionClient";
import ServerClient from "./clients/ServerClient";
import DevMode from "./devMode";
import { ProfileStorage } from "./profileStorage";
import { globalState } from "./state";
import { TabStorage } from "./tabStorage";
import { setTargetPrimaryTabId } from "./targetPrimaryTabId";
import { ExtensionMessageType } from "types/extensionMessage";
import browser from "webextension-polyfill";

const server = ServerClient.getInstance();
const tabStorage = TabStorage.getInstance();
const bgMessagingClient = BackgroundMessagingClient.getInstance();
const profileStorage = ProfileStorage.getInstance();

const domainRegex = /^https:\/\/(www\.)?(youtu\.be|youtube\.com)/;
const inviteLinkRegex = /^https:\/\/(www\.)?youtu\.be\/st\/(.+)$/;
const roomIdRegex = /^[a-zA-Z0-9.-]{8}$/;

const handleTab = async (tabId: number, url: string) => {
    const inviteLinkMatch = url.match(inviteLinkRegex);
    if (!inviteLinkMatch) return;

    const showErrorPage = () => {
        browser.tabs.update(tabId, {
            url: browser.runtime.getURL("/pages/error.html"),
        });
    };

    const roomId = inviteLinkMatch[2];
    const roomIdMatch = roomId.match(roomIdRegex);
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
            browser.tabs.update(primaryTabId, { active: true });
            browser.tabs.remove(tabId);
        }
    } else {
        const profile = await profileStorage.get();

        setTargetPrimaryTabId(tabId);
        // show loading screen
        browser.tabs.update(tabId, {
            url: browser.runtime.getURL("/pages/loading.html"),
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
        browser.tabs
            .get(primaryTabId)
            .then(() => resolve(primaryTabId))
            .catch(async () => {
                tabStorage.removeTab(primaryTabId);
                await clearPrimaryTab();
                resolve(null);
            });
    });
}

browser.webNavigation.onBeforeNavigate.addListener(
    details => {
        if (details.url) handleTab(details.tabId, details.url);
    },
    { url: [{ hostSuffix: "youtu.be" }] },
);

browser.tabs.onRemoved.addListener(async tabId => {
    DevMode.log("tab removed", { tabdId: tabId });
    getPrimaryTabIdOrUnset();
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
        return;
    }

    const primaryTabId = await getPrimaryTabIdOrUnset();
    if (primaryTabId !== tabId) {
        return;
    }

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
