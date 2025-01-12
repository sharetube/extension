import DevMode from "background-script/devMode";
import { globalState } from "background-script/state";
import config from "config";
import debounce from "lodash.debounce";
import { connectToWS } from "pkg/ws/ws";
import { ProfileType } from "types/profile.type";
import {
    FromServerMessagePayloadMap,
    FromServerMessageType,
    ToServerMessagePayloadMap,
    ToServerMessageType,
} from "types/serverMessage";

const { baseUrl } = config.api;

type MessageHandler<T extends FromServerMessageType> = (
    payload: FromServerMessagePayloadMap[T],
) => void;

type CloseCodeHandler = () => void;

const buildQueryParams = (params: Record<string, string>): string =>
    Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");

class ServerClient {
    private static instance: ServerClient;
    private ws: WebSocket | undefined;
    // todo: remove any
    private handlers: Map<FromServerMessageType, MessageHandler<any>>;
    private closeCodeHandlers: Map<number, CloseCodeHandler>;

    private constructor() {
        this.handlers = new Map();
        this.closeCodeHandlers = new Map();
    }

    public static getInstance(): ServerClient {
        return (ServerClient.instance ??= new ServerClient());
    }

    private async init(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws) reject(new Error("ws already open"));

            connectToWS(url).then(ws => {
                this.ws = ws;
                this.addListeners();
                this.debouncedKeepAlive();
                resolve();
            });
        });
    }

    private addListeners() {
        if (!this.ws) return;
        this.ws.onerror = event => {
            DevMode.log("WS: ERROR", event);
            this.close();
        };

        this.ws.onclose = (event: CloseEvent) => {
            DevMode.log("WS: CLOSED", { ...event });
            const handler = this.closeCodeHandlers.get(event.code);
            if (handler) {
                handler();
            } else {
                DevMode.log("WS: UNKNOWN CLOSE CODE", { code: event.code });
            }

            this.close();
        };

        this.ws.onmessage = ({ data }) => {
            this.debouncedKeepAlive();
            try {
                const { type, payload } = JSON.parse(data);
                DevMode.log("WS: FROM", { type, payload });
                const handler = this.handlers.get(type);
                if (handler) {
                    handler(payload);
                } else {
                    DevMode.log("WS: UNKNOWN MESSAGE TYPE", { type });
                }
            } catch (error) {
                DevMode.log(`WS ERROR: Parsing message: ${error}`);
            }
        };
    }

    private removeListeners() {
        if (!this.ws) return;

        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.onmessage = null;
    }

    private buildParams(profile: ProfileType, extraParams: object = {}) {
        return {
            username: profile.username,
            color: profile.color,
            ...(profile.avatar_url && { "avatar-url": profile.avatar_url }),
            ...extraParams,
        };
    }

    public createRoom(profile: ProfileType, videoUrl: string): Promise<void> {
        const params = this.buildParams(profile, { "video-url": videoUrl });
        DevMode.log("WS: CREATING ROOM", { ...params });
        // todo: implement WSConnectionURLBuilder
        return this.init(`wss://${baseUrl}/api/v1/ws/room/create?${buildQueryParams(params)}`);
    }

    public joinRoom(profile: ProfileType, room_id: string): Promise<void> {
        const params = this.buildParams(profile, globalState.jwt ? { jwt: globalState.jwt } : {});
        DevMode.log("WS: JOINING ROOM", { ...params });
        return this.init(
            `wss://${baseUrl}/api/v1/ws/room/${room_id}/join?${buildQueryParams(params)}`,
        );
    }

    public send<T extends ToServerMessageType>(type: T, payload?: ToServerMessagePayloadMap[T]) {
        if (!this.ws) return;
        const message = JSON.stringify({ type, payload: payload || null });
        this.debouncedKeepAlive();
        this.ws.send(message);
        DevMode.log("WS: TO", { type, payload });
    }

    public close() {
        if (!this.ws) return;

        this.debouncedKeepAlive.cancel();
        this.ws.close();
        this.removeListeners();
        this.ws = undefined;
        DevMode.log("WS: CLOSED", {});
    }

    public addHandler<T extends FromServerMessageType>(type: T, handler: MessageHandler<T>): void {
        this.handlers.set(type, handler);
    }

    public addCloseCodeHandler(closeCode: number, handler: CloseCodeHandler): void {
        this.closeCodeHandlers.set(closeCode, handler);
    }

    // https://developer.browser.com/docs/extensions/how-to/web-platform/websockets
    private debouncedKeepAlive = debounce(() => this.send(ToServerMessageType.ALIVE), 25 * 1000);
}

export default ServerClient;
