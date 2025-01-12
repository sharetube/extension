import { BackgroundMessagingClient } from "background-script/clients/ExtensionClient";
import DevMode from "background-script/devMode";
import { globalState, resetState } from "background-script/state";
import { TabStorage } from "background-script/tabStorage";
import { takeTargetPrimaryTabId } from "background-script/targetPrimaryTabId";
import { ExtensionMessageType } from "types/extensionMessage";
import { FromServerMessagePayloadMap, FromServerMessageType } from "types/serverMessage";
import browser from "webextension-polyfill";

const bgMessagingClient = BackgroundMessagingClient.getInstance();
const tabStorage = TabStorage.getInstance();

export function joinedRoom(
    payload: FromServerMessagePayloadMap[FromServerMessageType.JOINED_ROOM],
): void {
    resetState();
    globalState.jwt = payload.jwt;
    globalState.room = payload.room;
    globalState.is_admin = payload.joined_member.is_admin;

    const videoPageLink = `https://youtube.com/watch?v=${payload.room.player.video_url}&t=0`;
    const targetPrimaryTabId = takeTargetPrimaryTabId();
    if (targetPrimaryTabId) {
        browser.tabs.update(targetPrimaryTabId, { url: videoPageLink });
        // bgMessagingClient.sendMessage(
        //     targetPrimaryTabId,
        //     ExtensionMessageType.GO_TO_VIDEO,
        //     payload.room.player.video_url,
        // );
        // todo: skip that if target primary tab was primary tab
        bgMessagingClient.broadcastMessage(ExtensionMessageType.PRIMARY_TAB_SET);
        tabStorage.addTab(targetPrimaryTabId);
        tabStorage.setPrimaryTab(targetPrimaryTabId);
    } else {
        DevMode.log("No target primary tab found");
    }
}

export const videoRemoved = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.VIDEO_REMOVED],
): void => {
    globalState.room.playlist = payload.playlist;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYLIST_UPDATED,
        payload.playlist,
    );
};

export const videoAdded = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.VIDEO_ADDED],
): void => {
    globalState.room.playlist = payload.playlist;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYLIST_UPDATED,
        payload.playlist,
    );
};

export const playlistReordered = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.PLAYLIST_REORDERED],
): void => {
    globalState.room.playlist = payload.playlist;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYLIST_UPDATED,
        payload.playlist,
    );
};

export const memberJoined = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.MEMBER_JOINED],
): void => {
    globalState.room.members = payload.members;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.MEMBERS_UPDATED,
        payload.members,
    );
};

export const memberDisconnected = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.MEMBER_DISCONNECTED],
): void => {
    globalState.room.members = payload.members;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.MEMBERS_UPDATED,
        payload.members,
    );
};

export const memberUpdated = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.MEMBER_UPDATED],
): void => {
    globalState.room.members = payload.members;
    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.MEMBERS_UPDATED,
        payload.members,
    );
};

export const isAdminUpdated = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.IS_ADMIN_UPDATED],
): void => {
    globalState.is_admin = payload.is_admin;
    bgMessagingClient.broadcastMessage(ExtensionMessageType.ADMIN_STATUS_UPDATED, payload.is_admin);
};

export const playerStateUpdated = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.PLAYER_STATE_UPDATED],
): void => {
    globalState.room.player = payload.player;

    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYER_STATE_UPDATED,
        payload.player,
    );

    //? indicates loss of player_video_updated msg, should also get updated playlist
    // if (payload.player.video_url !== globalState.room.player.video_url) {
    //     bgMessagingClient.sendMessageToPrimaryTab(
    //         ExtensionMessageType.PLAYER_VIDEO_UPDATED,
    //         payload.player.video_url,
    //     );
    // }
};

export const playerVideoUpdated = (
    payload: FromServerMessagePayloadMap[FromServerMessageType.PLAYER_VIDEO_UPDATED],
): void => {
    globalState.room.playlist = payload.playlist;
    globalState.room.player = payload.player;
    globalState.room.members = payload.members;

    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYER_VIDEO_UPDATED,
        payload.player.video_url,
    );

    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.PLAYLIST_UPDATED,
        payload.playlist,
    );

    bgMessagingClient.sendMessageToPrimaryTab(
        ExtensionMessageType.MEMBERS_UPDATED,
        payload.members,
    );

    if (payload.playlist.last_video) {
        bgMessagingClient.sendMessageToPrimaryTab(
            ExtensionMessageType.LAST_VIDEO_UPDATED,
            payload.playlist.last_video,
        );
    }
};

export const kickedFromRoom = (): void => {
    DevMode.log("KICKED FROM ROOM", {});
    bgMessagingClient.sendMessageToPrimaryTab(ExtensionMessageType.KICKED);
};
