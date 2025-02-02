import { BackgroundMessagingClient } from "background-script/clients/ExtensionClient";
import ServerClient from "background-script/clients/ServerClient";
import { DebugModeStorage } from "background-script/logging/debugModeStorage";
import { BGLogger } from "background-script/logging/logger";
import { ProfileStorage } from "background-script/profileStorage";
import { globalState } from "background-script/state";
import {
	getPrimaryTabIdOrUnset,
	updatePrimaryTabUrlToRoomId,
} from "background-script/tab";
import { TabStorage } from "background-script/tabStorage";
import { dateNowInUs } from "shared/dateNowInUs";
import {
	type ExtensionMessagePayloadMap as EMPM,
	type ExtensionMessageResponseMap as EMRM,
	type ExtensionMessageType as EMType,
	ExtensionMessageType,
} from "types/extensionMessage";
import { ToServerMessageType as TSMType } from "types/serverMessage";
import browser from "webextension-polyfill";
import {
	getTargetPrimaryTabId,
	setTargetPrimaryTabId,
} from "../targetPrimaryTabId";

const server = ServerClient.getInstance();
const logger = BGLogger.getInstance();

const profileStorage = ProfileStorage.getInstance();
const debugModeStorage = DebugModeStorage.getInstance();
const bgMessagingClient = BackgroundMessagingClient.getInstance();
const tabStorage = TabStorage.getInstance();

export function addVideo(videoUrl: EMPM[EMType.ADD_VIDEO]): void {
	server.send(TSMType.ADD_VIDEO, {
		video_url: videoUrl,
		updated_at: dateNowInUs(),
		player_version: globalState.room.player.version,
		playlist_version: globalState.room.playlist.version,
	});
}

export function removeVideo(videoId: EMPM[EMType.REMOVE_VIDEO]): void {
	server.send(TSMType.REMOVE_VIDEO, {
		video_id: videoId,
		playlist_version: globalState.room.playlist.version,
	});
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
	return globalState.isAdmin;
}

export function promoteMember(memberId: EMPM[EMType.PROMOTE_MEMBER]): void {
	server.send(TSMType.PROMOTE_MEMBER, { member_id: memberId });
}

export function removeMember(memberId: EMPM[EMType.REMOVE_MEMBER]): void {
	server.send(TSMType.REMOVE_MEMBER, { member_id: memberId });
}

export function videoEnded(): void {
	server.send(TSMType.END_VIDEO, {
		player_version: globalState.room.player.version,
	});
}

export function updatePlayerVideo({
	videoId,
	updatedAt,
}: EMPM[EMType.UPDATE_PLAYER_VIDEO]): void {
	server.send(TSMType.UPDATE_PLAYER_VIDEO, {
		video_id: videoId,
		updated_at: updatedAt,
		player_version: globalState.room.player.version,
		playlist_version: globalState.room.playlist.version,
	});
}

export function getPlayerState(): EMRM[EMType.GET_PLAYER_STATE] {
	return globalState.room.player.state;
}

export function getPlayerVideoUrl(): EMRM[EMType.GET_CURRENT_VIDEO] {
	return globalState.room.playlist.current_video;
}

export function getLastVideo(): EMRM[EMType.GET_LAST_VIDEO] {
	return globalState.room.playlist.last_video;
}

export function updateMuted(isMuted: EMPM[EMType.UPDATE_MUTED]): void {
	server.send(TSMType.UPDATE_MUTED, { is_muted: isMuted });
}

export function updatePlayerState(
	payload: EMPM[EMType.UPDATE_PLAYER_STATE],
): void {
	globalState.room.player.state = payload;
	globalState.updatePlayerStateRid = Math.random().toString(36).substring(2);

	server.send(TSMType.UPDATE_PLAYER_STATE, {
		rid: globalState.updatePlayerStateRid,
		player_version: globalState.room.player.version,
		...payload,
	});
	globalState.room.player.version++;
}

export function updateReady(isReady: EMPM[EMType.UPDATE_READY]): void {
	server.send(TSMType.UPDATE_READY, { is_ready: isReady });
}

export function updateProfile(profile: EMPM[EMType.UPDATE_PROFILE]): void {
	profileStorage.set(profile).then(() => {
		bgMessagingClient.broadcastMessage(
			ExtensionMessageType.PROFILE_UPDATED,
			profile,
		);
		server.send(TSMType.UPDATE_PROFILE, profile);
	});
}

export function getProfile(): EMRM[EMType.GET_PROFILE] {
	return profileStorage.get();
}

export async function createRoom(
	payload: EMPM[EMType.CREATE_ROOM],
	sender: browser.Runtime.MessageSender,
) {
	if (sender?.tab?.id !== undefined) setTargetPrimaryTabId(sender.tab.id);
	const profile = await profileStorage.get();
	server.createRoom(profile, payload).then(() => {
		logger.log("ROOM CREATED", { videoUrl: payload });
	});
}

export function switchToPrimaryTab() {
	tabStorage.getPrimaryTab().then((primaryTabId) => {
		if (primaryTabId) browser.tabs.update(primaryTabId, { active: true });
	});
}

export async function isPrimaryTab(
	_: EMPM[EMType.IS_PRIMARY_TAB],
	sender?: browser.Runtime.MessageSender,
): EMRM[EMType.IS_PRIMARY_TAB] {
	if (sender?.tab?.id === undefined) {
		return false;
	}

	tabStorage.addTab(sender.tab.id);
	return getPrimaryTabIdOrUnset().then(
		(primaryTabId) => primaryTabId === sender.tab?.id,
	);
}

export function primaryTabLoaded(): void {
	if (globalState.waitingForPrimaryTab) {
		const targetPrimaryTabId = getTargetPrimaryTabId();
		if (targetPrimaryTabId) {
			tabStorage.addTab(targetPrimaryTabId);
			tabStorage.setPrimaryTab(targetPrimaryTabId);
			updatePrimaryTabUrlToRoomId();
			bgMessagingClient.broadcastMessage(ExtensionMessageType.PRIMARY_TAB_SET);
			globalState.waitingForPrimaryTab = false;
		}
	}
}

export function isPrimaryTabExists(): EMRM[EMType.IS_PRIMARY_TAB_EXISTS] {
	return getPrimaryTabIdOrUnset().then((primaryTabId) => primaryTabId !== null);
}

export function reorderPlaylist(payload: EMPM[EMType.REORDER_PLAYLIST]): void {
	server.send(TSMType.REORDER_PLAYLIST, {
		video_ids: payload,
		playlist_version: globalState.room.playlist.version,
	});
}

export function setDevMode(payload: EMPM[EMType.SET_DEVMODE]): void {
	logger.setEnabled(payload);
	debugModeStorage.set(payload);
	bgMessagingClient.broadcastMessage(
		ExtensionMessageType.DEVMODE_UPDATED,
		payload,
	);
}

export function getDevMode(): EMRM[EMType.GET_DEVMODE] {
	return logger.getEnabled();
}
