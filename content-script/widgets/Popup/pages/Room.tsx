import Button from "../shared/Button/Button";
import Input from "../shared/Input/Input";
import Title from "../shared/Title/Title";
import Avatar from "@entities/Avatar/Avatar";
import getVideoUrlFromLink from "@shared/api/validateVideo";
import { ContentScriptMessagingClient } from "@shared/client/client";
import Next from "@shared/ui/Next/Next";
import React, { useEffect, useState } from "react";
import { ExtensionMessageType } from "types/extensionMessage";
import { ProfileType } from "types/profile.type";

interface RoomProps {
    changePage: () => void;
    profile: ProfileType;
}

const Room: React.FC<RoomProps> = ({ profile, changePage }) => {
    const [isPrimaryTabExists, setIsPrimaryTabExists] = useState<boolean>(true);

    const contentSciptMessagingClient = new ContentScriptMessagingClient();

    useEffect(() => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.IS_PRIMARY_TAB_EXISTS).then(
            response => {
                setIsPrimaryTabExists(response);
                setIsNavigateButtonDisabled(!response);
            },
        );
        contentSciptMessagingClient.addHandler(ExtensionMessageType.PRIMARY_TAB_SET, () => {
            setIsPrimaryTabExists(true);
            setIsNavigateButtonDisabled(false);
        });

        contentSciptMessagingClient.addHandler(ExtensionMessageType.PRIMARY_TAB_UNSET, () => {
            setIsPrimaryTabExists(false);
            setIsNavigateButtonDisabled(true);
        });
    }, []);

    const [initVideoValue, setInitVideoValue] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [isCreateRoomButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isNavigateButtonDisabled, setIsNavigateButtonDisabled] = useState(true);

    const handleInitVideoLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInitVideoValue(value);

        getVideoUrlFromLink(value).then(response => {
            setVideoUrl(response);
            setIsButtonDisabled(!response);
        });
    };

    const handleCreateRoomButtonClick = () => {
        if (videoUrl) {
            setInitVideoValue("");
            ContentScriptMessagingClient.sendMessage(ExtensionMessageType.CREATE_ROOM, {
                videoUrl: videoUrl,
            });
        }
    };

    const switchToPrimaryTab = () => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.SWITCH_TO_PRIMARY_TAB);
    };

    const [isPrimaryTab, setIsPrimaryTab] = useState(true);
    useEffect(() => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.IS_PRIMARY_TAB).then(
            (response: boolean) => {
                setIsPrimaryTab(response);
            },
        );
    }, []);

    return (
        <React.Fragment>
            <header className="p-4 border-t-0 border-r-0 border-l-0 border-b border-solid border-spec-outline">
                <h1 className="font-secondary text-text-primary text-[16px] leading-[22px] font-normal select-none">
                    ShareTube
                </h1>
            </header>
            <section
                className={`p-[16px_25px_16px_16px] flex items-center justify-between ${isPrimaryTab ? "" : "border-t-0 border-r-0 border-l-0 border-b border-solid border-spec-outline"}  hover:cursor-pointer`}
                onClick={changePage}
                title="ShareTube profile"
            >
                <div className="flex items-center gap-4 select-none">
                    <Avatar
                        size="m"
                        url={profile.avatar_url}
                        //? isn't [0] better
                        letter={profile.username.slice(0, 1)}
                        color={profile.color}
                    />
                    <h2
                        className="text-[16px] leading-[22px] font-normal font-secondary"
                        style={{ color: profile.color }}
                    >
                        {profile.username}
                    </h2>
                </div>
                <div>
                    <Next />
                </div>
            </section>
            {isPrimaryTabExists && !isPrimaryTab && (
                <section className="flex items-center justify-center p-[16px]">
                    <Button disabled={isNavigateButtonDisabled} onClick={switchToPrimaryTab}>
                        Navigate to player tab
                    </Button>
                </section>
            )}
            {!isPrimaryTabExists && (
                <section className="p-[16px]">
                    <Title>Initial video</Title>
                    <Input value={initVideoValue} onChange={handleInitVideoLinkChange} />
                    <div className="m-[32px_0_0]">
                        <Button
                            onClick={handleCreateRoomButtonClick}
                            disabled={isCreateRoomButtonDisabled}
                        >
                            Create room
                        </Button>
                    </div>
                </section>
            )}
        </React.Fragment>
    );
};

export default Room;
