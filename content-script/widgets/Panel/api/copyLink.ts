import { ContentScriptMessagingClient } from "@shared/client/client";
import { logger } from "@tabs/All/All";
import { ExtensionMessageType } from "types/extensionMessage";

function callOncePerInterval(func: () => void, delay: number) {
    let isAllowed = true;

    return function () {
        if (isAllowed) {
            func();
            isAllowed = false;

            setTimeout(() => {
                isAllowed = true; // Reset the state after the delay
            }, delay);
        }
    };
}
const throttledCopyLink = callOncePerInterval(() => {
    (
        document.querySelector(
            "yt-copy-link-renderer yt-button-renderer .yt-spec-touch-feedback-shape",
        ) as HTMLElement
    ).click();
}, 3500);

const copyLink = () => {
    ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_ROOM_ID).then(payload => {
        const link = `https://youtu.be/st/${payload}`;
        throttledCopyLink();
        navigator.clipboard.writeText(link);
        logger.log("LINK COPIED", { link });
    });
};

export default copyLink;
