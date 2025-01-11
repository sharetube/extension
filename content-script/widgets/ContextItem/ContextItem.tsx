import useAdmin from "@shared/Context/Admin/hooks/useAdmin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import ShareTube from "@shared/ui/ShareTube/ShareTube";
import React, { useEffect, useState } from "react";
import { ExtensionMessageType } from "types/extensionMessage";

interface ContextItemProps {
    videoUrl: string;
    callback: () => void;
}

const ContextItem: React.FC<ContextItemProps> = ({ videoUrl, callback }) => {
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

    const sendCreateRoom = () => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.CREATE_ROOM, {
            videoUrl,
        });
    };

    const sendAddVideo = () => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.ADD_VIDEO, videoUrl);
    };

    const onClick: React.MouseEventHandler<HTMLDivElement> = e => {
        e.stopPropagation();

        if (!isPrimaryTabExists) {
            callback();
            sendCreateRoom();
            return;
        }

        if (isPrimaryTabExists && isAdmin) {
            callback();
            sendAddVideo();
            return;
        }
    };

    return (
        <div
            className={`st-context-item ${isPrimaryTabExists && !isAdmin ? "hover:cursor-not-allowed" : ""}`}
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
    );
};

export default ContextItem;
