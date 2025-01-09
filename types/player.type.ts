export type PlayerStateType = {
    playback_rate: number;
    is_playing: boolean;
    is_ended: boolean;
    current_time: number;
    updated_at: number;
};

export type PlayerType = PlayerStateType & {
    video_url: string;
};

export type PlayerElement = HTMLVideoElement;
