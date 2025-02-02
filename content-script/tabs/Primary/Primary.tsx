import Player from "@player/player";
import { AdminProvider } from "@shared/Context/Admin/Admin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import waitForElement from "@shared/lib/waitForElement";
import { CSLogger } from "@shared/logging/logger";
import Panel from "@widgets/Panel/Panel";
import Search from "@widgets/Search/Search";
import React from "react";
import { createRoot } from "react-dom/client";
import { ExtensionMessageType } from "types/extensionMessage";

const logger = CSLogger.getInstance();

const contentScriptMessageClient = new ContentScriptMessagingClient();
let isPrimaryTab = false;

ContentScriptMessagingClient.sendMessage(
	ExtensionMessageType.PRIMARY_TAB_LOADED,
);

const hideShareStyleId = "hide-share-style";
const hideElementsStyleId = "hide-elements-style";

function update() {
	ContentScriptMessagingClient.sendMessage(
		ExtensionMessageType.IS_PRIMARY_TAB,
	).then((res: boolean) => {
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

			let hideElementsStyle = document.getElementById(hideElementsStyleId);

			if (!hideElementsStyle) {
				hideElementsStyle = document.createElement("style");
				hideElementsStyle.id = hideElementsStyleId;
				document.head.appendChild(hideElementsStyle);
			}
			hideElementsStyle.textContent = `
					.ytp-button[data-tooltip-target-id="ytp-autonav-toggle-button"],
					#flexible-item-buttons,
					#voice-search-button,
					yt-button-shape#button-shape,
					.ytp-next-button.ytp-button,
					.ytp-miniplayer-button {
						display: none !important;
					}
					`;

			initPlayer();
			initSearch();
			showMainPanel();

			// open share panel
			waitForElement(
				"#above-the-fold #menu > ytd-menu-renderer yt-button-view-model button",
			).then((openButton) => {
				openButton.click();

				// closing share panel
				waitForElement(
					"yt-copy-link-renderer yt-button-renderer .yt-spec-touch-feedback-shape",
				).then(() => {
					(
						document.body.querySelector(
							"ytd-unified-share-panel-renderer yt-icon-button > button",
						) as HTMLButtonElement
					).click();

					setTimeout(() => (hideShareStyle.textContent = ""), 400);
				});
			});
		} else {
			disablePlayer();
			disableSearch();
			hideMainPanel();

			const hideElementsStyle = document.getElementById(hideElementsStyleId);
			if (hideElementsStyle) {
				hideElementsStyle.textContent = "";
			}
		}
	});
}

contentScriptMessageClient.addHandler(
	ExtensionMessageType.PRIMARY_TAB_UNSET,
	() => {
		update();
	},
);
update();

contentScriptMessageClient.addHandler(ExtensionMessageType.KICKED, () => {
	window.postMessage({ type: "GO_TO_MAIN" }, "*");
});

contentScriptMessageClient.addHandler(
	ExtensionMessageType.UPDATE_URL,
	(url) => {
		logger.log("UPDATE_URL", { url });
		window.history.replaceState({}, "", url);
	},
);

let player: Player | null = null;
function initPlayer() {
	waitForElement(".html5-video-player").then((e) => {
		waitForElement("video", e).then((p) => {
			player = new Player(e, p as HTMLVideoElement);
		});
		// .catch(error => console.log("Failed select video element", error));
	});
	// .catch(error => console.log("Failed select player element", error));
}

function disablePlayer() {
	if (!player) return;
	player.clearAll();
}

function hideElement(elem: HTMLElement) {
	elem.style.display = "none";
}

function showElement(elem: HTMLElement) {
	elem.style.display = "";
}

function showMainPanel() {
	waitForElement("#secondary-inner").then((elem) => {
		hideElement(elem);
		const container = document.createElement("div");
		container.id = "st-main-panel";
		container.className = "sharetube";
		elem.parentElement?.prepend(container);

		createRoot(container).render(
			<AdminProvider>
				<Panel />
			</AdminProvider>,
		);
	});
	// .catch(error => console.log("Failed to render main panel", error));
}

function hideMainPanel() {
	waitForElement("#secondary-inner").then((elem) => {
		showElement(elem);
		elem.parentElement?.firstChild?.remove();
	});
	// .catch(error => console.log("Failed to render main panel", error));
}

function initSearch() {
	waitForElement("#center").then((elem) => {
		Array.from(elem.children).forEach((child) => {
			hideElement(child as HTMLElement);
		});
		const container = document.createElement("div");
		container.id = "st-search-input";
		container.className = "sharetube";
		container.style.width = "100%";
		elem.prepend(container);

		createRoot(container).render(
			<AdminProvider>
				<Search />
			</AdminProvider>,
		);
	});
	// .catch(error => console.log("Failed to render input", error));
}

function disableSearch() {
	waitForElement("#center").then((elem) => {
		elem.firstChild?.remove();
		Array.from(elem.children).forEach((child) => {
			showElement(child as HTMLElement);
		});
	});
}
