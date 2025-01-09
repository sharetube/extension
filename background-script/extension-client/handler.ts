import { setTargetPrimaryTabId } from "../targetPrimaryTabId";
import { BackgroundMessagingClient } from "background-script/clients/ExtensionClient";
import ServerClient from "background-script/clients/ServerClient";
import { ProfileStorage } from "background-script/profileStorage";
import { globalState } from "background-script/state";
import { getPrimaryTabIdOrUnset } from "background-script/tab";
import { TabStorage } from "background-script/tabStorage";
import {
    ExtensionMessagePayloadMap as EMPM,
    ExtensionMessageResponseMap as EMRM,
    ExtensionMessageType as EMType,
    ExtensionMessageType,
} from "types/extensionMessage";
import { ToServerMessageType as TSMType } from "types/serverMessage";

const server = ServerClient.getInstance();

const profileStorage = ProfileStorage.getInstance();
const bgMessagingClient = BackgroundMessagingClient.getInstance();
const tabStorage = TabStorage.getInstance();

export function addVideo(videoUrl: EMPM[EMType.ADD_VIDEO]): void {
    server.send(TSMType.ADD_VIDEO, { video_url: videoUrl });
}

export function removeVideo(videoId: EMPM[EMType.ADD_VIDEO]): void {
    server.send(TSMType.REMOVE_VIDEO, { video_id: videoId });
}

export function getPlaylist(): EMRM[EMType.GET_PLAYLIST] {
    return globalState.room.playlist;
}

export function getMembers(): EMRM[EMType.GET_MEMBERS] {
    return globalState.room.members;
}

export function getRoomId(): EMRM[EMType.GET_ROOM_ID] {
    return globalState.room.id;
}

export function getIsAdmin(): EMRM[EMType.GET_IS_ADMIN] {
    return globalState.is_admin;
}

export function promoteMember(memberId: EMPM[EMType.PROMOTE_MEMBER]): void {
    server.send(TSMType.PROMOTE_MEMBER, { member_id: memberId });
}

export function removeMember(memberId: EMPM[EMType.REMOVE_MEMBER]): void {
    server.send(TSMType.REMOVE_MEMBER, { member_id: memberId });
}

export function skipCurrentVideo(
    updatedAt: EMPM[EMType.SKIP_CURRENT_VIDEO],
): EMRM[EMType.SKIP_CURRENT_VIDEO] {
    if (globalState.room.playlist.videos.length === 0) {
        server.send(TSMType.UPDATE_PLAYER_STATE, globalState.room.player);
        return false;
    }

    server.send(TSMType.UPDATE_PLAYER_VIDEO, {
        video_id: globalState.room.playlist.videos[0].id,
        updated_at: updatedAt,
    });
    return true;
}

export function updatePlayerVideo({ videoId, updatedAt }: EMPM[EMType.UPDATE_PLAYER_VIDEO]): void {
    server.send(TSMType.UPDATE_PLAYER_VIDEO, {
        video_id: videoId,
        updated_at: updatedAt,
    });
}

export function getPlayerState(): EMRM[EMType.GET_PLAYER_STATE] {
    return globalState.room.player;
}

export function getPlayerVideoUrl(): EMRM[EMType.GET_PLAYER_VIDEO_URL] {
    return globalState.room.player.video_url;
}

export function getLastVideo(): EMRM[EMType.GET_LAST_VIDEO] {
    return globalState.room.playlist.last_video;
}

export function updateMuted(isMuted: EMPM[EMType.UPDATE_MUTED]): void {
    server.send(TSMType.UPDATE_MUTED, { is_muted: isMuted });
}

export function updatePlayerState(playerState: EMPM[EMType.UPDATE_PLAYER_STATE]): void {
    if (playerState.video_url !== globalState.room.player.video_url) {
        return;
    }

    globalState.room.player.current_time = playerState.current_time;
    globalState.room.player.is_playing = playerState.is_playing;
    globalState.room.player.playback_rate = playerState.playback_rate;
    globalState.room.player.updated_at = playerState.updated_at;

    server.send(TSMType.UPDATE_PLAYER_STATE, playerState);
}

export function updateReady(isReady: EMPM[EMType.UPDATE_READY]): void {
    server.send(TSMType.UPDATE_READY, { is_ready: isReady });
}

export function updateProfile(profile: EMPM[EMType.UPDATE_PROFILE]): void {
    profileStorage.set(profile).then(() => {
        bgMessagingClient.broadcastMessage(ExtensionMessageType.PROFILE_UPDATED, profile);
        server.send(TSMType.UPDATE_PROFILE, profile);
    });
}

export function getProfile(): EMRM[EMType.GET_PROFILE] {
    return profileStorage.get();
}

export async function createRoom(
    payload: EMPM[EMType.CREATE_ROOM],
    sender: chrome.runtime.MessageSender,
) {
    if (sender?.tab?.id !== undefined) setTargetPrimaryTabId(sender.tab.id);
    const profile = await profileStorage.get();
    server.createRoom(profile, payload.videoUrl).then(() => {
        console.log("room created");
    });
}

export function switchToPrimaryTab() {
    tabStorage.getPrimaryTab().then(primaryTabId => {
        if (primaryTabId) chrome.tabs.update(primaryTabId, { active: true });
    });
}

export async function isPrimaryTab(
    _: EMPM[EMType.IS_PRIMARY_TAB],
    sender?: chrome.runtime.MessageSender,
): EMRM[EMType.IS_PRIMARY_TAB] {
    if (sender?.tab?.id === undefined) {
        return false;
    }

    tabStorage.addTab(sender.tab.id);
    return getPrimaryTabIdOrUnset().then(primaryTabId => primaryTabId === sender.tab?.id);
}

export function isPrimaryTabExists(): EMRM[EMType.IS_PRIMARY_TAB_EXISTS] {
    return getPrimaryTabIdOrUnset().then(primaryTabId => primaryTabId !== null);
}
