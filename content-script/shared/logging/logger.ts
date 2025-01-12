import { ContentScriptMessagingClient } from "@shared/client/client";
import Logger from "shared/logger";
import { ExtensionMessageType } from "types/extensionMessage";

export class CsLogger extends Logger {
    private static instance: CsLogger;

    constructor() {
        super();
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_DEVMODE).then(
            debugMode => {
                this.setEnabled(debugMode);
            },
        );

        const contentScriptMessagingClient = new ContentScriptMessagingClient();

        contentScriptMessagingClient.addHandler(
            ExtensionMessageType.DEVMODE_UPDATED,
            (devMode: boolean) => {
                this.setEnabled(devMode);
            },
        );
    }

    public static getInstance(): CsLogger {
        return (CsLogger.instance ??= new CsLogger());
    }
}
