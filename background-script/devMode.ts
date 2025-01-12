import { BackgroundMessagingClient } from "./clients/ExtensionClient";
import BaseDevMode from "shared/baseDevMode";
import { ExtensionMessageType } from "types/extensionMessage";
import browser from "webextension-polyfill";

class DevMode extends BaseDevMode {
    static setEnabled(value: boolean) {
        this.enabled = value;

        this.log("DEVMODE BACKGROUND SCRIPT", { enabled: value });
        browser.storage.local.set({ "st-dev-mode": value.toString() });

        BackgroundMessagingClient.getInstance().broadcastMessage(
            ExtensionMessageType.DEVMODE_UPDATED,
            value,
        );
    }

    static isEnabled(): boolean {
        return this.enabled;
    }
}

export default DevMode;
