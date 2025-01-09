import useAdmin from "@shared/Context/Admin/hooks/useAdmin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import ShareTube from "@shared/ui/ShareTube/ShareTube";
import React, { useEffect, useState } from "react";
import { ExtensionMessageType } from "types/extensionMessage";

interface ContextItemInterface {
    id: string;
}

const ContextItem: React.FC<ContextItemInterface> = ({ id }) => {
    const { isAdmin } = useAdmin();
    const [isPrimaryTabExists, setIsPrimaryTabExists] = useState<boolean>(true);

    const contentSciptMessagingClient = new ContentScriptMessagingClient();

    useEffect(() => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.IS_PRIMARY_TAB_EXISTS).then(
            response => {
                setIsPrimaryTabExists(response);
            },
        );
        contentSciptMessagingClient.addHandler(ExtensionMessageType.PRIMARY_TAB_SET, () => {
            setIsPrimaryTabExists(true);
        });

        contentSciptMessagingClient.addHandler(ExtensionMessageType.PRIMARY_TAB_UNSET, () => {
            setIsPrimaryTabExists(false);
        });
    }, []);

    const createRoom = (videoUrl: string) => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.CREATE_ROOM, {
            videoUrl: videoUrl,
        });
    };

    const addVideo = (videoId: string) => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.ADD_VIDEO, videoId);
    };

    const onClick: React.MouseEventHandler<HTMLDivElement> = e => {
        e.stopPropagation();

        if (!isPrimaryTabExists) {
            createRoom(id);
            return;
        }
        if (isPrimaryTabExists && isAdmin) {
            addVideo(id);
            return;
        }
        if (isPrimaryTabExists && !isAdmin) {
            return;
        }
    };

    return (
        <div>
            <div
                className={`sharetube st-context-item ${isPrimaryTabExists && !isAdmin ? "hover:cursor-not-allowed" : ""}`}
                title={isPrimaryTabExists && !isAdmin ? "You can't add videos" : ""}
                onClick={onClick}
            >
                <div className="flex items-center p-[0_12px_0_16px] h-[36px] hover:cursor-pointer hover:bg-spec-button-chip-background-hover">
                    <div className="m-[0_16px_0_0] text-text-primary">
                        <ShareTube />
                    </div>

                    <p className="m-0 p-0 text-text-primary font-secondary text-[1.4rem] leading-[2rem] font-normal">
                        {!isPrimaryTabExists && "Start room"}
                        {isPrimaryTabExists && isAdmin && "Add to playlist"}
                        {isPrimaryTabExists && !isAdmin && "You can't add videos"}
                    </p>
                </div>
                <div className="h-[1px] w-full bg-spec-outline m-[8px_0]"></div>
            </div>
        </div>
    );
};

export default ContextItem;
