import { BaseMessagingClient } from "../../../shared/baseExtensionClient";
import DevMode from "background-script/devMode";
import {
    ExtensionMessage,
    ExtensionMessagePayloadMap,
    ExtensionMessageType,
} from "types/extensionMessage";
import { logObject } from "types/logObject.type";
import browser from "webextension-polyfill";

export class ContentScriptMessagingClient extends BaseMessagingClient {
    public constructor() {
        super();
    }

    public static async sendMessage<T extends ExtensionMessageType>(
        type: T,
        payload?: ExtensionMessagePayloadMap[T],
    ): Promise<any> {
        const message: ExtensionMessage<T> = { type, payload };
        try {
            DevMode.log("sending message to bg worker", message);
            const response = await browser.runtime.sendMessage(message);
            DevMode.log("recieved response", response as logObject);
            return response;
        } catch (error) {
            DevMode.log(`Error sending message: ${error}`);
            throw error;
        }
    }
}
