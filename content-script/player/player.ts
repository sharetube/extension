import { dateNowInUs } from "../../shared/dateNowInUs";
import { ContentScriptMessagingClient } from "@shared/client/client";
import { CsLogger } from "@shared/logging/logger";
import {
    ExtensionMessagePayloadMap,
    ExtensionMessageResponseMap,
    ExtensionMessageType,
} from "types/extensionMessage";
import { Mode } from "types/mode";
import { PlayerStateType, PlayerType } from "types/player.type";

interface MastheadElement extends HTMLElement {
    theater: boolean;
}

const logger = CsLogger.getInstance();

class Player {
    private e: HTMLElement; // todo: rename
    private player: HTMLVideoElement;

    private isAdmin: boolean;

    private mode: Mode;
    private muted: boolean | undefined;
    private videoUrl: string;
    private isReady: boolean;
    private isPlayAfterEndedHandled: boolean;
    private adShowing: boolean;
    private isDataLoaded: boolean;
    private ignoreSeekingCount: number;
    private ignorePlayCount: number;
    private ignorePauseCount: number;

    private contentScriptMessagingClient: ContentScriptMessagingClient;
    private observer: MutationObserver | undefined;
    private abortController: AbortController;

    public constructor(e: HTMLElement, p: HTMLVideoElement) {
        this.e = e;
        this.player = p;
        this.isAdmin = false;

        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_IS_ADMIN).then(
            (res: ExtensionMessageResponseMap[ExtensionMessageType.GET_IS_ADMIN]) => {
                this.isAdmin = res;
            },
        );

        this.mode = Mode.DEFAULT;
        this.videoUrl = "";
        this.isReady = false;
        this.isPlayAfterEndedHandled = true;
        this.adShowing = false;
        this.isDataLoaded = false;
        this.ignoreSeekingCount = 0;
        this.ignorePlayCount = 0;
        this.ignorePauseCount = 0;

        this.contentScriptMessagingClient = new ContentScriptMessagingClient();
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_PLAYER_VIDEO_URL).then(
            (url: string) => {
                this.videoUrl = url;
            },
        );

        this.contentScriptMessagingClient.addHandler(
            ExtensionMessageType.PLAYER_VIDEO_UPDATED,
            (videoUrl: ExtensionMessagePayloadMap[ExtensionMessageType.PLAYER_VIDEO_UPDATED]) => {
                this.videoUrl = videoUrl;
                this.updateVideo(videoUrl);
            },
        );

        this.contentScriptMessagingClient.addHandler(
            ExtensionMessageType.PLAYER_STATE_UPDATED,
            (state: ExtensionMessagePayloadMap[ExtensionMessageType.PLAYER_STATE_UPDATED]) => {
                logger.log("recieved new player state", state);
                if (this.adShowing) return;
                this.setState(state);
            },
        );

        this.contentScriptMessagingClient.addHandler(
            ExtensionMessageType.ADMIN_STATUS_UPDATED,
            (payload: ExtensionMessagePayloadMap[ExtensionMessageType.ADMIN_STATUS_UPDATED]) => {
                logger.log("admin status updated", { isAdmin: payload });
                this.isAdmin = payload;
            },
        );

        this.abortController = new AbortController();

        this.observeElement();
        this.addEventListeners();
        this.sendMute();
    }

    private addEventListeners() {
        // Mute handle
        this.player.addEventListener("volumechange", this.handleMute.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("play", this.handlePlay.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("pause", this.handlePause.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("seeking", this.handleSeeking.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("ratechange", this.handleRatechange.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("waiting", this.handleWaiting.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("canplay", this.handleCanplay.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("loadeddata", this.handleLoadedData.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("ended", this.handleEnded.bind(this), {
            signal: this.abortController.signal,
        });
        this.player.addEventListener("emptied", this.handleEmptied.bind(this), {
            signal: this.abortController.signal,
        });

        document.addEventListener("keydown", this.handleKeyDown.bind(this), {
            signal: this.abortController.signal,
        });
    }

    private clearEventListeners() {
        this.abortController.abort(); // Removes all listeners attached with this controller
        this.abortController = new AbortController();
    }

    private clearContentScriptHandlers() {
        this.contentScriptMessagingClient.removeHandler(ExtensionMessageType.PLAYER_VIDEO_UPDATED);
        this.contentScriptMessagingClient.removeHandler(ExtensionMessageType.PLAYER_STATE_UPDATED);
        this.contentScriptMessagingClient.removeHandler(ExtensionMessageType.ADMIN_STATUS_UPDATED);
    }

    public clearAll() {
        logger.log("clearAll");
        this.clearUpdateIsReadyFalseTimeout();
        this.clearEventListeners();
        this.clearContentScriptHandlers();
        this.disconnectObserver();
    }

    private setActualState() {
        logger.log("setActualState");
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.GET_PLAYER_STATE).then(
            (state: PlayerStateType) => {
                logger.log("fetched player state", state);
                this.setState(state);
            },
        );
    }

    private sendSkip() {
        logger.log("sending skip");
        ContentScriptMessagingClient.sendMessage(
            ExtensionMessageType.SKIP_CURRENT_VIDEO,
            dateNowInUs(),
        ).then(res => {
            if (res) return;

            const state = this.getState();
            state.is_ended = true;
            this.setState(state);
            this.handleStateChanged();
        });
    }

    //? add same for isReady true
    private udpateIsReadyFalseTimeout: NodeJS.Timeout | undefined;
    private setUpdateIsReadyFalseTimeout(): void {
        logger.log("setUpdateIsReadyFalseTimeout");
        this.clearUpdateIsReadyFalseTimeout();
        this.udpateIsReadyFalseTimeout = setTimeout(() => {
            if (!this.isReady) return;
            logger.log("update is ready false timeout");
            this.isReady = false;
            ContentScriptMessagingClient.sendMessage(ExtensionMessageType.UPDATE_READY, false);
            this.clearUpdateIsReadyFalseTimeout();
        }, 500);
    }

    private clearUpdateIsReadyFalseTimeout(): boolean {
        if (!this.udpateIsReadyFalseTimeout) {
            return false;
        }

        clearTimeout(this.udpateIsReadyFalseTimeout);
        this.udpateIsReadyFalseTimeout = undefined;
        return true;
    }

    // Handlers
    private handleKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowRight":
                logger.log("ArrowRight");
                this.ignorePlayCount--;
                if (this.isAdmin && this.player.duration - this.player.currentTime < 5) {
                    this.sendSkip();
                }

                break;
            case "ArrowLeft":
                logger.log("ArrowLeft");
                this.ignorePlayCount--;

                break;
        }
    }

    private handleWaiting() {
        logger.log("waiting");
        if (this.isDataLoaded) {
            this.setUpdateIsReadyFalseTimeout();
        }
    }

    private handleEnded() {
        logger.log("ended");
        if (!this.isAdmin) {
            logger.log("ended ignored because is not admin");
            return;
        }
        this.sendSkip();
    }

    private handleEmptied() {
        if (this.adShowing) {
            logger.log("emptied ignored because ad is showing");
            return;
        }
        logger.log("emptied");

        this.adShowing = false;
        this.ignoreSeekingCount = 0;
        this.ignorePlayCount = 0;
        this.ignorePauseCount = 0;
        this.isReady = false;
        this.isDataLoaded = false;
    }

    private handlePause() {
        if (this.adShowing) {
            logger.log("pause ignored because ad is showing");
            return;
        }

        if (this.ignorePauseCount > 0) {
            logger.log("pause ignored");
            this.ignorePauseCount--;
            return;
        }

        logger.log("pause");
        this.handleStateChanged();
    }

    private handleCanplay() {
        if (this.adShowing) {
            logger.log("canplay ignored because ad is showing");
            return;
        }

        logger.log("canplay");
        if (!this.clearUpdateIsReadyFalseTimeout()) {
            if (this.isReady) return;
            this.isReady = true;
            ContentScriptMessagingClient.sendMessage(ExtensionMessageType.UPDATE_READY, true);
            this.setActualState();
        }
    }

    private handleLoadedData() {
        if (this.adShowing) {
            logger.log("loaded data ignored because ad is showing");
            return;
        }

        logger.log("loaded data");
        this.isDataLoaded = true;
    }

    private handlePlay() {
        if (this.adShowing) {
            logger.log("play ignored because ad is showing");
            return;
        }

        if (!this.isDataLoaded) {
            logger.log("play ignored because data not loaded");
            return;
        }

        if (this.ignorePlayCount > 0) {
            logger.log("play ignored");
            this.ignorePlayCount--;
            return;
        }

        logger.log("play");
        if (!this.isPlayAfterEndedHandled) {
            this.isPlayAfterEndedHandled = true;
            this.setActualState();
            return;
        }

        this.handleStateChanged();
    }

    private handleSeeking() {
        if (this.adShowing) {
            logger.log("seeking ignored because ad is showing");
            return;
        }

        if (this.ignoreSeekingCount > 0) {
            logger.log("seeking ignored");
            this.ignoreSeekingCount--;
            return;
        }

        logger.log("seeking");
        if (this.isDataLoaded && this.getIsPlaying()) {
            // logger.log("ignore play count ++", { playCountBefore: this.ignorePlayCount });
            this.ignorePlayCount++;
        }
        this.handleStateChanged();
    }

    private handleRatechange() {
        if (this.adShowing) {
            logger.log("ratechange ignored because ad is showing");
            return;
        }
        logger.log("ratechange");

        this.handleStateChanged();
    }

    // Mute
    private sendMute() {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.UPDATE_MUTED, this.muted!);
    }

    private handleMute() {
        if (this.player.muted === this.muted) {
            logger.log("mute ignored");
            return;
        }
        logger.log("mute");
        this.muted = this.player.muted;
        this.sendMute();
    }

    public setState(state: PlayerStateType) {
        let ct;
        if (state.is_ended) {
            // 1s - too low
            // 2s - ok
            // todo: try to low as possible, in range 1-2s
            ct = this.player.duration - 2;
            this.isPlayAfterEndedHandled = false;
        } else {
            if (state.is_playing) {
                const delta = dateNowInUs() - state.updated_at;
                ct = Math.round(state.current_time + delta * state.playback_rate) / 1e6;
                logger.log("delta", { delta });
            } else {
                ct = state.current_time / 1e6;
            }
        }

        if (state.is_playing && !this.getIsPlaying()) {
            this.ignorePlayCount++;
        } else if (!state.is_playing && this.getIsPlaying()) {
            this.ignorePauseCount++;
        }
        if (state.is_playing) {
            (this.player.play() as Promise<void>).catch(() => {
                logger.log("error calling play, clicking player...");
                this.player.click();
            });
        } else {
            this.player.pause();
        }
        this.player.currentTime = ct;
        this.ignoreSeekingCount++;

        this.player.playbackRate = state.playback_rate;

        logger.log("setted player state", {
            current_time: ct,
            playback_rate: state.playback_rate,
            is_playing: state.is_playing,
        });
    }

    public getIsPlaying(): boolean {
        return !this.player.paused;
    }

    public getState(): PlayerType {
        const s = {
            video_url: this.videoUrl,
            updated_at: dateNowInUs(),
            current_time: Math.round(this.player.currentTime * 1e6),
            playback_rate: this.player.playbackRate,
            is_ended: false,
            is_playing: this.getIsPlaying(),
        };
        logger.log("get state returned", s);
        return s;
    }

    private handleStateChanged() {
        if (!this.isReady) return;
        if (this.isAdmin) {
            logger.log("sending state to server");
            ContentScriptMessagingClient.sendMessage(
                ExtensionMessageType.UPDATE_PLAYER_STATE,
                this.getState(),
            );
        } else {
            this.setActualState();
        }
    }

    private updateVideo(videoUrl: string) {
        window.postMessage({ type: "SKIP", payload: videoUrl }, "*");
    }

    private observeElement(): void {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    this.handleAdChanged(this.e.classList);
                    this.handleModeChanged(this.e.classList);
                }
            });
        });

        this.observer.observe(this.e, {
            attributes: true,
            attributeFilter: ["class"],
        });
    }

    private disconnectObserver(): void {
        if (!this.observer) return;
        this.observer.disconnect();
        this.observer = undefined;
    }

    // Ad handling
    private handleAdChanged(cl: DOMTokenList): void {
        const adShowing = cl.contains("ad-showing");
        if (this.adShowing === adShowing) return;

        logger.log("ad changed", { was: this.adShowing, now: adShowing });
        this.adShowing = adShowing;
        if (this.adShowing) {
            this.isReady = false;
            ContentScriptMessagingClient.sendMessage(ExtensionMessageType.UPDATE_READY, false);
        }
    }

    // Player mode
    private handleModeChanged(cl: DOMTokenList): void {
        const classNames = Array.from(cl);
        const c = (className: string) => classNames.includes(className);

        if (c("ytp-modern-miniplayer")) {
            this.setMode(Mode.MINI);
            return;
        }

        if (c("ytp-fullscreen") && c("ytp-big-mode")) {
            this.setMode(Mode.FULL);
            return;
        }

        const masthead = document.querySelector(
            "#content > #masthead-container > #masthead",
        ) as MastheadElement;

        if (masthead && masthead.hasAttribute("theater")) {
            this.setMode(Mode.THEATER);
            return;
        }

        this.setMode(Mode.DEFAULT);
    }

    private setMode(mode: Mode) {
        if (this.mode === mode) return;
        this.mode = mode;
    }
}

export default Player;
