import { video, videoID } from "./video";
import { profile } from "types/profile";

export enum ExtensionMessageType {
    PRIMARY_TAB_SET = "PRIMARY_TAB_SET",
    PRIMARY_TAB_UNSET = "PRIMARY_TAB_UNSET",
    PROFILE_UPDATED = "PROFILE_UPDATED",
    GET_PROFILE = "GET_PROFILE",
    UPDATE_PROFILE = "UPDATE_PROFILE",
    CREATE_ROOM = "CREATE_ROOM",
    SWITCH_TO_PRIMARY_TAB = "SWITCH_TO_PRIMARY_TAB",
    CHECK_PRIMARY_TAB_EXISTS = "CHECK_PRIMARY_TAB_EXISTS",
    IS_PRIMARY_TAB = "IS_PRIMARY_TAB",
    // Room
    GET_ADMIN_STATUS = "GET_ADMIN_STATUS",
    ADMIN_STATUS_UPDATED = "ADMIN_STATUS_UPDATED",
    GET_PLAYLIST = "GET_PLAYLIST",
    PLAYLIST_UPDATED = "PLAYLIST_UPDATED",
    UPDATE_PLAYLIST = "UPDATE_PLAYLIST",
    GET_USERS = "GET_USERS",
    USERS_UPDATED = "USERS_UPDATED",
    ADD_VIDEO = "ADD_VIDEO",
}

export interface CrateRoomPayload {
    videoId: string;
}

export type ExtensionMessagePayloadMap = {
    [ExtensionMessageType.PRIMARY_TAB_SET]: null;
    [ExtensionMessageType.PRIMARY_TAB_UNSET]: null;
    [ExtensionMessageType.PROFILE_UPDATED]: profile;
    [ExtensionMessageType.GET_PROFILE]: null;
    [ExtensionMessageType.UPDATE_PROFILE]: profile;
    [ExtensionMessageType.SWITCH_TO_PRIMARY_TAB]: null;
    [ExtensionMessageType.CHECK_PRIMARY_TAB_EXISTS]: null;
    [ExtensionMessageType.IS_PRIMARY_TAB]: null;
    [ExtensionMessageType.CREATE_ROOM]: CrateRoomPayload;
    // Room
    [ExtensionMessageType.GET_ADMIN_STATUS]: null;
    [ExtensionMessageType.ADMIN_STATUS_UPDATED]: null;
    [ExtensionMessageType.GET_PLAYLIST]: null;
    [ExtensionMessageType.PLAYLIST_UPDATED]: null;
    [ExtensionMessageType.UPDATE_PLAYLIST]: video[];
    [ExtensionMessageType.GET_USERS]: null;
    [ExtensionMessageType.USERS_UPDATED]: null;
    [ExtensionMessageType.ADD_VIDEO]: videoID;
};

export interface ExtensionMessage<T extends ExtensionMessageType> {
    type: ExtensionMessageType;
    payload: ExtensionMessagePayloadMap[T];
}
