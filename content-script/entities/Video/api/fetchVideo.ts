import VideoData from "../types/videoData.type";

const fetchVideo = (url: string, retries: number = 3): Promise<VideoData> => {
    const func = (attempt: number): Promise<VideoData> =>
        fetch(`https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${url}`)
            .then(res => res.json())
            .then(data => ({
                title: data.title,
                author_name: data.author_name,
                thumbnail_url: data.thumbnail_url,
                author_url: data.author_url,
            }))
            .catch(error => {
                if (attempt < retries) return func(attempt + 1);
                throw error;
            });

    return func(0);
};

export default fetchVideo;
