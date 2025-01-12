import { BaseMessagingClient } from "../../shared/baseExtensionClient";
import { logger } from "background-script/logging/logger";
import { TabStorage } from "background-script/tabStorage";
import {
    ExtensionMessage,
    ExtensionMessagePayloadMap,
    ExtensionMessageType,
} from "types/extensionMessage";
import browser from "webextension-polyfill";

export class BackgroundMessagingClient extends BaseMessagingClient {
    private static instance: BackgroundMessagingClient;
    private tabStorage: TabStorage;

    constructor() {
        super();
        this.tabStorage = TabStorage.getInstance();
    }

    public static getInstance(): BackgroundMessagingClient {
        return (BackgroundMessagingClient.instance ??= new BackgroundMessagingClient());
    }

    public sendMessage<T extends ExtensionMessageType>(
        tabId: number,
        type: T,
        payload?: ExtensionMessagePayloadMap[T],
    ): void {
        const message: ExtensionMessage<T> = { type, payload };
        browser.tabs
            .sendMessage(tabId, message)
            .catch(err => logger.log("failed to send to tab", { err, tabId }));

        logger.log(`sending message to tab ${tabId}`, message);
    }

    public async sendMessageToPrimaryTab<T extends ExtensionMessageType>(
        type: T,
        payload?: ExtensionMessagePayloadMap[T],
    ): Promise<void> {
        const primaryTabId = await this.tabStorage.getPrimaryTab();
        if (!primaryTabId) {
            logger.log("Error trying send to primary tab: no primary tab found");
            return;
        }

        const message: ExtensionMessage<T> = { type, payload };
        logger.log("sending message to primary tab", message);
        browser.tabs
            .sendMessage(primaryTabId, message)
            .catch(err => logger.log(`failed to send to primary tab: ${err}`));
    }

    public broadcastMessage<T extends ExtensionMessageType>(
        type: T,
        payload?: ExtensionMessagePayloadMap[T],
    ): void {
        const message: ExtensionMessage<T> = { type, payload };
        this.tabStorage.getTabs().forEach(tabId => {
            browser.tabs
                .sendMessage(tabId, message)
                .catch(err =>
                    logger.log(`failed to send to tab while broadcasting`, { err, tabId }),
                );
        });
    }
}
