import Avatar from "@entities/Avatar/Avatar";
import useAdmin from "@shared/Context/Admin/hooks/useAdmin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import BigShield from "@shared/ui/BigShield/BigShield";
import MemberIcon from "@shared/ui/Member/Member";
import Mute from "@shared/ui/Mute/Mute";
import Shield from "@shared/ui/Shield/Shield";
import React, { useCallback, useEffect } from "react";
import { ExtensionMessageType } from "types/extensionMessage";
import { MemberType } from "types/member.type";

type MemberProps = MemberType;

const Member: React.FC<MemberProps> = ({
    id,
    username,
    avatar_url,
    color,
    is_ready,
    is_muted,
    is_admin,
}) => {
    const { isAdmin: isAdminStatus } = useAdmin();
    const [ignore, setIgnore] = React.useState(false); // used to ignore the click event after openMenu
    const [menu, setMenu] = React.useState(false);

    const handleClick = (e: MouseEvent) => {
        if (ignore) {
            setIgnore(false);
            return;
        }

        if (menu && !(e.target as HTMLElement).classList.contains("st-member")) {
            setMenu(false);
        }
    };

    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => handleClick(e);

        if (menu) {
            document.addEventListener("click", handleDocumentClick);
        } else {
            document.removeEventListener("click", handleDocumentClick);
        }

        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, [menu]);

    const openMenu = useCallback(() => {
        if (!isAdminStatus) return;
        setIgnore(true);
        setMenu(true);
    }, [isAdminStatus]);

    const promote = useCallback(() => {
        if (!isAdminStatus) return;
        setMenu(false);
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.PROMOTE_MEMBER, id);
    }, [id, isAdminStatus]);

    const kick = useCallback(() => {
        if (!isAdminStatus) return;
        setMenu(false);
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.REMOVE_MEMBER, id);
    }, [id, isAdminStatus]);

    return (
        <li className="relative">
            <div
                className={`flex items-center  ${isAdminStatus ? "hover:cursor-pointer" : "hover:cursor-default"} ${is_ready ? "" : "animate-pulse"}`}
                onClick={openMenu}
            >
                <Avatar size="s" url={avatar_url} color={color} letter={username.slice(0, 1)} />
                {/* Username */}
                <p
                    className={`m-0 p-[0_0_0_8px] text-text-primary font-secondary leading-normal text-[1.25rem] font-medium`}
                    style={{ color }}
                >
                    {username}
                </p>
                {/* Icons */}
                <div className="flex items-center">
                    {is_admin && (
                        <div
                            className={`text-text-primary h-[14px] w-[12px] box-border m-[0_0_0_4px]`}
                        >
                            <Shield />
                        </div>
                    )}
                    {is_muted && (
                        <div
                            className={`text-text-secondary h-[12px] w-[12px] box-border m-[0_-2px_0_4px]`}
                        >
                            <Mute />
                        </div>
                    )}
                </div>
            </div>
            {isAdminStatus && menu && !is_admin && (
                <div
                    className="st-member absolute top-[36px] left-0 w-[150px] rounded-lg shadow-box-shadow bg-spec-menu-background z-[2300] p-[8px_0]"
                    onClick={e => {
                        e.stopPropagation();
                    }}
                >
                    <div className="hover:cursor-pointer hover:bg-spec-button-chip-background-hover">
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                promote();
                            }}
                            className="p-[0_16px] m-0 flex border-none rounded-[8px] bg-transparent items-center w-[24px] h-[36px] "
                        >
                            <div className="h-[24px] w-[24px] flex items-center justify-center box-border text-text-primary hover:cursor-pointer">
                                <BigShield />
                            </div>
                            <p className="text-[14px] leading-[2rem] font-normal font-secondary text-text-primary m-[0_24px_0_16px] hover:cursor-pointer">
                                Promote
                            </p>
                        </button>
                    </div>
                    <div className="hover:cursor-pointer hover:bg-spec-button-chip-background-hover">
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                kick();
                            }}
                            className="p-[0_16px] m-0 flex border-none rounded-[8px] bg-transparent items-center w-[24px] h-[36px] hover:cursor-pointer"
                        >
                            <div className="h-[24px] w-[24px] flex items-center justify-center box-border text-text-primary hover:cursor-pointer">
                                <MemberIcon />
                            </div>
                            <p className="text-[14px] leading-[2rem] font-normal font-secondary text-text-primary m-[0_24px_0_16px] hover:cursor-pointer">
                                Kick
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};

export default Member;
