import { AdminProvider } from "@shared/Context/Admin/Admin";
import waitForElement from "@shared/lib/waitForElement";
import ContextItem from "@widgets/ContextItem/ContextItem";
import Popup from "@widgets/Popup/Popup";
import React from "react";
import ReactDOM from "react-dom";

// Render popup
waitForElement("#end")
    .then(elem => {
        const popupContainer = document.createElement("div");
        popupContainer.id = "st-popup-container";
        popupContainer.className = "sharetube";

        ReactDOM.render(<Popup />, popupContainer);
        elem.prepend(popupContainer);
    })
    .catch(error => console.error("ST: Failed to render popup", error));

// Context item renderer
const contextMenuContainer = document.createElement("div");
contextMenuContainer.id = "st-context-menu";
contextMenuContainer.className = "sharetube";
contextMenuContainer.style.minWidth = "149px";

const ytVideoRegex = /^https:\/\/(www\.)?(youtu\.be|youtube\.com)\/watch\?v=([^&]+)/;

const videoUrlFromThumbnail = (e: Element): string => {
    const thumbnail = e.querySelector("a#thumbnail");
    if (!thumbnail) return "";

    const match = (thumbnail as HTMLAnchorElement).href.match(ytVideoRegex);
    return match ? match[3] : "";
};

const videoUrlFromLocation = (): string => {
    const match = window.location.href.match(ytVideoRegex);
    return match ? match[3] : "";
};

const handleClick = (e: MouseEvent) => {
    const tagNames = [
        "ytd-compact-video-renderer",
        "ytd-rich-item-renderer",
        "ytd-playlist-video-renderer",
        "ytd-grid-video-renderer",
        "ytd-video-renderer",
        "ytd-watch-metadata",
        "ytd-playlist-panel-video-renderer",
    ];

    let enteredIf: boolean = false;

    const dropdowns = Array.from(
        document.querySelector("ytd-popup-container")!.querySelectorAll("tp-yt-iron-dropdown"),
    );
    const dropdown = dropdowns.find(e => !(e as HTMLElement).id);
    const listbox = dropdown?.querySelector("tp-yt-paper-listbox");

    const removeRender = () => {
        if (listbox) {
            const contextMenu = listbox.querySelector("#st-context-menu");
            if (contextMenu) {
                listbox.removeChild(contextMenu);
            }
        }
    };
    const callback = () => {
        removeRender();
        document.body.click();
    };

    for (const tagName of tagNames) {
        const elem = (e.target as HTMLElement).closest(tagName);

        if (elem) {
            enteredIf = true;

            const url = videoUrlFromThumbnail(elem) || videoUrlFromLocation();

            ReactDOM.render(
                <AdminProvider>
                    <ContextItem videoUrl={url} callback={callback} />
                </AdminProvider>,
                contextMenuContainer,
            );

            if (listbox) {
                listbox.prepend(contextMenuContainer);
            }

            break;
        }
    }

    if (!enteredIf) {
        removeRender();
    }
};

document.addEventListener("click", handleClick);
