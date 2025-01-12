import { MemberType } from "./member.type";
import { PlayerType } from "./player.type";
import { RoomType } from "./room.type";
import { PlaylistType, VideoType } from "./video.type";

export enum ToServerMessageType {
    UPDATE_PROFILE = "UPDATE_PROFILE",
    PROMOTE_MEMBER = "PROMOTE_MEMBER",
    REMOVE_MEMBER = "REMOVE_MEMBER",
    ADD_VIDEO = "ADD_VIDEO",
    REMOVE_VIDEO = "REMOVE_VIDEO",
    REORDER_PLAYLIST = "REORDER_PLAYLIST",
    UPDATE_READY = "UPDATE_READY",
    UPDATE_MUTED = "UPDATE_MUTED",
    UPDATE_PLAYER_STATE = "UPDATE_PLAYER_STATE",
    UPDATE_PLAYER_VIDEO = "UPDATE_PLAYER_VIDEO",
    ALIVE = "ALIVE",
}

export enum FromServerMessageType {
    JOINED_ROOM = "JOINED_ROOM",
    PLAYER_VIDEO_UPDATED = "PLAYER_VIDEO_UPDATED",
    VIDEO_ADDED = "VIDEO_ADDED",
    VIDEO_REMOVED = "VIDEO_REMOVED",
    PLAYLIST_REORDERED = "PLAYLIST_REORDERED",
    MEMBER_JOINED = "MEMBER_JOINED",
    MEMBER_DISCONNECTED = "MEMBER_DISCONNECTED",
    MEMBER_UPDATED = "MEMBER_UPDATED",
    IS_ADMIN_UPDATED = "IS_ADMIN_UPDATED",
    PLAYER_STATE_UPDATED = "PLAYER_STATE_UPDATED",
}

const TO = ToServerMessageType;
const FROM = FromServerMessageType;

export type ToServerMessagePayloadMap = {
    [TO.UPDATE_PROFILE]: {
        username: string;
        color: string;
        avatar_url: string;
    };
    [TO.PROMOTE_MEMBER]: {
        member_id: string;
    };
    [TO.REMOVE_MEMBER]: {
        member_id: string;
    };
    [TO.ADD_VIDEO]: {
        video_url: string;
    };
    [TO.REMOVE_VIDEO]: {
        video_id: number;
    };
    [TO.REORDER_PLAYLIST]: {
        video_ids: number[];
    };
    [TO.UPDATE_READY]: {
        is_ready: boolean;
    };
    [TO.UPDATE_MUTED]: {
        is_muted: boolean;
    };
    [TO.UPDATE_PLAYER_STATE]: {
        playback_rate: number;
        is_playing: boolean;
        current_time: number;
        updated_at: number;
    };
    [TO.UPDATE_PLAYER_VIDEO]: {
        video_id: number;
        updated_at: number;
    };
    [TO.ALIVE]: void;
};

export type FromServerMessagePayloadMap = {
    [FROM.JOINED_ROOM]: {
        jwt: string;
        joined_member: MemberType;
        room: RoomType;
    };
    [FROM.PLAYER_VIDEO_UPDATED]: {
        player: PlayerType;
        playlist: PlaylistType;
        members: MemberType[];
    };
    [FROM.VIDEO_ADDED]: {
        added_video: VideoType;
        playlist: PlaylistType;
    };
    [FROM.VIDEO_REMOVED]: {
        removed_video_id: number;
        playlist: PlaylistType;
    };
    [FROM.PLAYLIST_REORDERED]: {
        playlist: PlaylistType;
    };
    [FROM.MEMBER_JOINED]: {
        joined_member: MemberType;
        members: MemberType[];
    };
    [FROM.MEMBER_DISCONNECTED]: {
        disconnected_member_id: string;
        members: MemberType[];
    };
    [FROM.MEMBER_UPDATED]: {
        updated_member: MemberType;
        members: MemberType[];
    };
    [FROM.IS_ADMIN_UPDATED]: {
        is_admin: boolean;
    };
    [FROM.PLAYER_STATE_UPDATED]: {
        player: PlayerType;
    };
};

export interface ToServerMessage<T extends ToServerMessageType> {
    type: ToServerMessageType;
    payload: ToServerMessagePayloadMap[T];
}

export interface FromServerMessage<T extends FromServerMessageType> {
    type: FromServerMessageType;
    payload: FromServerMessagePayloadMap[T];
}
