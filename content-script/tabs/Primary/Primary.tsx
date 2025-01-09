import Player from "@player/player";
import { AdminProvider } from "@shared/Context/Admin/Admin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import waitForElement from "@shared/lib/waitForElement";
import Panel from "@widgets/Panel/Panel";
import Search from "@widgets/Search/Search";
import React from "react";
import ReactDOM from "react-dom/client";
import { ExtensionMessageType } from "types/extensionMessage";

const contentScriptMessageClient = new ContentScriptMessagingClient();
let isPrimaryTab = false;

const hideShareStyleId = "hide-share-style";
function update() {
    ContentScriptMessagingClient.sendMessage(ExtensionMessageType.IS_PRIMARY_TAB).then(
        (res: boolean) => {
            if (isPrimaryTab === res) return;
            isPrimaryTab = res;

            if (res) {
                let hideShareStyle = document.getElementById(hideShareStyleId);

                if (!hideShareStyle) {
                    hideShareStyle = document.createElement("style");
                    hideShareStyle.id = hideShareStyleId;
                    document.head.appendChild(hideShareStyle);
                }
                hideShareStyle.textContent = `
                    tp-yt-iron-overlay-backdrop,
                    tp-yt-paper-dialog {
                        display: none !important;
                    }
                `;

                initPlayer();
                initSearch();
                hideAutoplayButton();
                hideNextVideoButton();
                hideBottomPanel();
                hideClipButton();
                hideVoiceSearchButton();
                showMainPanel();

                // open share panel
                waitForElement(
                    "#above-the-fold #menu > ytd-menu-renderer yt-button-view-model button",
                ).then(openButton => {
                    openButton.click();

                    // closing share panel
                    waitForElement(
                        "yt-copy-link-renderer yt-button-renderer .yt-spec-touch-feedback-shape",
                    ).then(() => {
                        (
                            document.body.querySelector(
                                "ytd-unified-share-panel-renderer yt-icon-button > button",
                            ) as HTMLElement
                        ).click();

                        setTimeout(() => (hideShareStyle.textContent = ``), 200);
                    });
                });
            } else {
                disablePlayer();
                disableSearch();
                showAutoplayButton();
                showNextVideoButton();
                showBottomPanel();
                showClipButton();
                showVoiceSearchButton();
                hideMainPanel();
            }
        },
    );
}

contentScriptMessageClient.addHandler(ExtensionMessageType.PRIMARY_TAB_UNSET, () => {
    update();
});
update();

contentScriptMessageClient.addHandler(ExtensionMessageType.KICKED, () => {
    window.postMessage({ type: "GO_TO_MAIN" }, "*");
});

let player: Player | null = null;
function initPlayer() {
    waitForElement(".html5-video-player").then(e => {
        waitForElement("video").then(p => {
            console.log("Player found");
            player = new Player(e as HTMLElement, p as HTMLVideoElement);
        });
        // .catch(error => console.log("Failed select video element", error));
    });
    // .catch(error => console.log("Failed select player element", error));
}

function disablePlayer() {
    if (!player) return;
    player.clearAll();
}

type ElementWithOriginalDisplay = HTMLElement & { originalDisplay?: string };

function hideElement(elem: ElementWithOriginalDisplay) {
    elem.style.display = "none";
}

function showElement(elem: ElementWithOriginalDisplay) {
    elem.style.display = "";
}

function hideAutoplayButton() {
    waitForElement(".ytp-autonav-toggle-button-container").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
    });
    // .then(error => console.log("Failed to remove autoplay button", error));
}

function showAutoplayButton() {
    waitForElement(".ytp-autonav-toggle-button-container").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to remove autoplay button", error));
}

function hideNextVideoButton() {
    waitForElement(".ytp-next-button.ytp-button").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to remove next button", error));
}

function showNextVideoButton() {
    waitForElement(".ytp-next-button.ytp-button").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to remove next button", error));
}

function hideClipButton() {
    waitForElement("#flexible-item-buttons").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to remove clip button", error));
}

function showClipButton() {
    waitForElement("#flexible-item-buttons").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to remove clip button", error));
}

function hideBottomPanel() {
    waitForElement("yt-button-shape#button-shape").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to shape button", error));
}

function showBottomPanel() {
    waitForElement("yt-button-shape#button-shape").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
    });
    // .catch(error => console.log("Failed to shape button", error));
}

function showMainPanel() {
    waitForElement("#secondary-inner").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
        const container = document.createElement("div");
        container.id = "st-main-panel";
        container.className = "sharetube";
        elem.parentElement?.prepend(container);

        ReactDOM.createRoot(container).render(
            <AdminProvider>
                <Panel />
            </AdminProvider>,
        );
    });
    // .catch(error => console.log("Failed to render main panel", error));
}

function hideMainPanel() {
    waitForElement("#secondary-inner").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
        elem.parentElement?.firstChild?.remove();
    });
    // .catch(error => console.log("Failed to render main panel", error));
}

function initSearch() {
    waitForElement("#center").then(elem => {
        Array.from(elem.children).forEach(child => {
            hideElement(child as ElementWithOriginalDisplay);
        });
        const container = document.createElement("div");
        container.id = "st-search-input";
        container.style.width = "100%";
        elem.prepend(container);

        ReactDOM.createRoot(container).render(
            <AdminProvider>
                <Search />
            </AdminProvider>,
        );
    });
    // .catch(error => console.log("Failed to render input", error));
}

function disableSearch() {
    waitForElement("#center").then(elem => {
        elem.firstChild!.remove();
        Array.from(elem.children).forEach(child => {
            showElement(child as ElementWithOriginalDisplay);
        });
    });
}

function showVoiceSearchButton() {
    waitForElement("#voice-search-button").then(elem => {
        showElement(elem as ElementWithOriginalDisplay);
    });
}

function hideVoiceSearchButton() {
    waitForElement("#voice-search-button").then(elem => {
        hideElement(elem as ElementWithOriginalDisplay);
    });
}
