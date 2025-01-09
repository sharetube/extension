const updateVideoUrl = (videoUrl: string) => {
    const a = document.body.querySelector(
        "ytd-compact-video-renderer ytd-thumbnail > a",
    ) as HTMLElement;
    if (!a) return;

    (a as any).data.watchEndpoint.videoId = videoUrl;
    (a as any).data.commandMetadata.webCommandMetadata.url = `/watch?v=${videoUrl}&t=0`;
    a.click();
};

function goToMain() {
    const logo = document.querySelector(
        ".yt-simple-endpoint .style-scope .ytd-topbar-logo-renderer",
    ) as HTMLElement;
    if (!logo) return;

    logo.click();
}

window.addEventListener("message", event => {
    const { type, payload } = event.data;
    // todo: add to constants
    switch (type) {
        case "GO_TO_MAIN":
            goToMain();
            break;
        case "SKIP":
            updateVideoUrl(payload);
            break;
        default:
            return;
    }
});
