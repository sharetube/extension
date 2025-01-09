const waitForElement = (selector: string, timeout = 2000, retries = 3): Promise<HTMLElement> =>
    new Promise((resolve, reject) => {
        const attempt = (retryCount: number) => {
            const element = document.querySelector(selector);
            if (element instanceof HTMLElement) return resolve(element);

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element instanceof HTMLElement) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                if (retryCount > 0) {
                    console.log("ST: ", "Retrying... ", retryCount, selector);
                    attempt(retryCount - 1);
                } else {
                    reject(`Failed to find element with selector: ${selector}`);
                }
            }, timeout);
        };

        attempt(retries);
    });

export default waitForElement;
