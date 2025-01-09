import { AdminProvider } from "@shared/Context/Admin/Admin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import waitForElement from "@shared/lib/waitForElement";
import ContextItem from "@widgets/ContextItem/ContextItem";
import Popup from "@widgets/Popup/Popup";
import ReactDOM from "react-dom";
import { ExtensionMessageType } from "types/extensionMessage";

// Render popup
waitForElement("#end")
    .then(elem => {
        const container = document.createElement("div");
        container.id = "st-popup-container";
        container.className = "sharetube";
        elem.prepend(container);
        ReactDOM.render(<Popup />, container);
    })
    .catch(error => console.error("ST: Failed to render popup", error));

// Context item renderer
const container = document.createElement("div");
container.id = "st-context-menu";
container.style.minWidth = "149px";

const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;

const getThambnail = (e: Element): string => {
    const thumbnail = e.querySelector("a#thumbnail");
    if (thumbnail) {
        const match = (thumbnail as HTMLAnchorElement).href.match(regex);
        return match ? match[1] : "";
    }
    return "";
};

const getUrl = (): string => {
    const match = window.location.href.match(regex);
    return match ? match[1] : "";
};

const gg = (e: Element) => {
    const dropdowns = Array.from(
        document.querySelector("ytd-popup-container")!.querySelectorAll("tp-yt-iron-dropdown"),
    );
    const element = dropdowns
        .find(e => !(e as HTMLElement).id)
        ?.querySelector("tp-yt-paper-listbox");

    const url = getThambnail(e);
    const id = !!url ? url : getUrl();

    ReactDOM.render(
        <AdminProvider>
            <ContextItem id={id} />
        </AdminProvider>,
        container,
    );
    element.prepend(container);
};

const clickHandle = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("ytd-compact-video-renderer");
    const b = (e.target as HTMLElement).closest("ytd-rich-item-renderer");

    const c = (e.target as HTMLElement).closest("ytd-watch-metadata");

    if (a) {
        gg(a);
    } else if (b) {
        gg(b);
    } else if (c) {
        gg(c);
    }
};

document.addEventListener("click", clickHandle);
