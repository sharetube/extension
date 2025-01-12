import getVideoUrlFromLink from "../../shared/api/validateVideo";
import useKey from "./hooks/useKey";
import useAdmin from "@shared/Context/Admin/hooks/useAdmin";
import { ContentScriptMessagingClient } from "@shared/client/client";
import AddIcon from "@shared/ui/AddIcon/AddIcon";
import DevMode from "background-script/devMode";
import React, { useState } from "react";
import { ExtensionMessageType } from "types/extensionMessage";

const Search: React.FC = () => {
    const { isAdmin } = useAdmin();
    const [inputValue, setInputValue] = useState<string>("");
    const inputRef = useKey("/");

    const add = (videoId: string) => {
        ContentScriptMessagingClient.sendMessage(ExtensionMessageType.ADD_VIDEO, videoId);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setInputValue(e.target.value);

    const handleAdd = () => {
        getVideoUrlFromLink(inputValue)
            .then(videoId => {
                add(videoId);
                setInputValue("");
            })
            .catch(error => DevMode.log("SEARCH INPUT ERROR", { ...error }));
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") handleAdd();
    };

    return (
        <div
            className={`st-search relative m-[0_auto] border-box w-[100%] max-w-[536px] ${isAdmin ? "" : "opacity-50 hover:cursor-not-allowed"}`}
        >
            <div className="box-border flex rounded-full border border-solid border-spec-outline">
                <div className="box-border h-[40px] w-[100%] flex-grow">
                    <input
                        type="text"
                        className={`${isAdmin ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} m-0 h-[40px] w-[100%] border-none bg-transparent p-[0_4px_0_16px] font-secondary text-[16px] font-normal leading-[22px] text-text-primary outline-none placeholder:text-text-secondary`}
                        placeholder={isAdmin ? "Enter video url here" : "You can't add videos"}
                        disabled={!isAdmin}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        ref={inputRef}
                    />
                </div>
                <button
                    onClick={handleAdd}
                    title={isAdmin ? "Add" : ""}
                    disabled={!isAdmin}
                    className={`${isAdmin ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} border-l-solid m-0 box-border flex h-[40px] w-[64px] items-center justify-center rounded-br-full rounded-tr-full border-b-0 border-l border-r-0 border-t-0 border-solid border-spec-outline bg-background-primary p-[1px_4px]`}
                >
                    <div className="box-border h-[24px] w-[24px] text-text-primary">
                        <AddIcon />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Search;
