window.addEventListener("message", (event) => {
	const { type } = event.data;
	if (type === "GET_CONTEXT_MENU_VIDEO") {
		const el = document.body.querySelector(
			"ytd-menu-popup-renderer",
		) as HTMLElement & {
			data: any;
		};
		if (!el) return;
		if (!el.data) return;

		const items = el.data.items;
		let videoUrl = "";
		for (const item of items) {
			videoUrl =
				item.menuServiceItemRenderer?.serviceEndpoint?.signalServiceEndpoint
					?.actions[0]?.addToPlaylistCommand?.videoId;

			if (videoUrl || null) {
				break;
			}
		}

		event.source?.postMessage(
			{
				type: "CONTEXT_MENU_VIDEO",
				payload: { videoUrl },
			},
			{
				targetOrigin: event.origin,
			},
		);
	}
});
