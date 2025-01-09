export async function connectToWS(url: string): Promise<WebSocket> {
    return new Promise((resolve: (val: WebSocket) => void, reject) => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
            resolve(ws);
        };
        ws.onclose = (event: CloseEvent) => {
            switch (event.code) {
                case 1006:
                    reject("Wrong URL");
                    break;
                default:
                    reject("Unknown error");
            }
        };
    }).then(ws => {
        // Clear the listeners before returning
        ws.onopen = ws.onclose = null;
        return ws;
    });
}
