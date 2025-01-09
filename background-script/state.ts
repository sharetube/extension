import { RoomType } from "types/room.type";

type State = {
    jwt: string;
    room: RoomType;
    is_admin: boolean;
};

export const defaultState: State = {
    jwt: "",
    is_admin: false,
    room: {
        id: "",
        playlist: {
            videos: [],
            last_video: null,
        },
        player: {
            video_url: "",
            current_time: 0,
            is_playing: false,
            is_ended: false,
            playback_rate: 1,
            updated_at: 0,
        },
        members: [],
    },
};

export const globalState: State = defaultState;

export function resetState(): void {
    Object.assign(globalState, defaultState);
}
