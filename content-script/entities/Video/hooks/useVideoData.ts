import fetchVideo from "../api/fetchVideo";
import VideoData from "../types/videoData.type";
import { useEffect, useState } from "react";

const useVideoData = (videoUrl: string) => {
    const [loading, setLoading] = useState(true);
    const [videoData, setVideoData] = useState<VideoData>({} as VideoData);

    useEffect(() => {
        fetchVideo(videoUrl)
            .then(data => {
                setVideoData(data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
            });
    }, [videoUrl]);

    return { loading, videoData };
};

export default useVideoData;
