(() => {
    // Handle errors
    const handleError = console.error;

    // Wait for element to be available in the DOM with a timeout
    const waitElement = (selector, timeout = 10000) =>
        new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(
                    new Error(
                        `Element "${selector}" not found after ${timeout}ms`
                    )
                );
            }, timeout);
        });

    // Create an element in the DOM from a template
    const createElement = async (selector, templatePath, elementClass) => {
        try {
            const parentElement = await waitElement(selector);
            const response = await fetch(chrome.runtime.getURL(templatePath));
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");
            const element = doc.querySelector(elementClass);
            parentElement.prepend(element);
        } catch (error) {
            handleError(error);
        }
    };

    // Check ad element
    const checkAd = () => {
        const ad = document.querySelector(".ad-showing");
        return ad ? true : false;
    };

    // Wait for the ad to end
    const waitForAdToEnd = () =>
        new Promise(resolve => {
            const checkAd = () => {
                if (!document.querySelector(".ad-showing")) {
                    resolve();
                } else {
                    requestAnimationFrame(checkAd);
                }
            };
            checkAd();
        });

    // Get the current state of the video
    const getState = player => ({
        isPlayed: !player.paused,
        time: player.currentTime,
        speed: player.playbackRate,
    });

    // Set the state of the video
    const setState = (player, { isPlayed, time, speed }) => {
        player.playbackRate = speed;
        isPlayed ? player.play() : player.pause();
        player.currentTime = time;
    };

    // Send the state of the video
    const sendState = player => console.log(getState(player));

    // Actions to mute or unmute video by user
    const muteVideo = () => {
        console.log("Mute video");
    };

    const unmuteVideo = () => {
        console.log("Unmute video");
    };

    // Add event listeners to the player
    const addVideoEventListeners = player => {
        const events = ["play", "pause"];
        events.forEach(event => {
            player.addEventListener(event, () => {
                sendState(player);
            });
        });

        // Change the speed of the video
        player.addEventListener("ratechange", () => {
            if (!player.isPlayed) {
                sendState(player);
            }
        });

        // Mute and unmute the video
        let isMute = null;
        player.addEventListener("volumechange", () => {
            if (player.muted && !isMute) {
                muteVideo();
                isMute = true;
            }
            if (isMute !== false && !player.muted) {
                unmuteVideo();
                isMute = false;
            }
        });
    };

    // Add event listeners to youtube player
    const initializeVideoPlayer = () => {
        waitElement("video.video-stream.html5-main-video")
            .then(addVideoEventListeners)
            .catch(handleError);
    };

    waitForAdToEnd().then(initializeVideoPlayer).catch(handleError);

    createElement(
        "#secondary-inner",
        "/src/templates/playlist.html",
        ".st-playlist"
    );
})();
