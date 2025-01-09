import { ContentScriptMessagingClient } from "@shared/client/client";
import { ExtensionMessageType } from "types/extensionMessage";

function callOncePerInterval(func, delay) {
    let isAllowed = true;

    return function (...args) {
        if (isAllowed) {
            func(...args); // Execute the function
            isAllowed = false;

            setTimeout(() => {
                isAllowed = true; // Reset the state after the delay
            }, delay);
        }
    };
}
const throttledCopyLink = callOncePerInterval(() => {
    document
        .querySelector("yt-copy-link-renderer yt-button-renderer .yt-spec-touch-feedback-shape")!
        .click();
    console.log("Copied link to clipboard");
}, 3500);

const copyLink = () => {
    ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_ROOM_ID).then(payload => {
        const link = `https://youtu.be/st/${payload}`;
        throttledCopyLink();
        navigator.clipboard.writeText(link);
    });
};

export default copyLink;
