import copyLink from "./api/copyLink";
import useResize from "@shared/hooks/useResize";
import Button from "@shared/ui/Button/Button";
import Expand from "@shared/ui/Expand/Expand";
import Members from "@shared/ui/Members/Members";
import Share from "@shared/ui/Share/Share";
import MemberList from "@widgets/Memberlist/Memberlist";
import Playlist from "@widgets/Playlist/Playlist";
import React, { useState } from "react";

const Panel: React.FC = () => {
    const { isFullScreen, height } = useResize();

    const [isExpanded, setIsExpanded] = useState(true);
    const [userCount, setUserCount] = useState<number>(0);

    const toggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <div
            className="st-panel m-0 box-border flex min-h-[400px] w-[100%] flex-col overflow-hidden rounded-[12px] border border-solid border-spec-outline"
            style={{ height: height }}
        >
            <header className="m-0 box-border flex w-[100%]  items-center justify-between bg-background-primary border-b border-solid border-spec-outline border-t-0 border-l-0 border-r-0 p-[5px_6px_5px_12px]">
                <p className="m-0 select-none p-0 font-primary text-[2rem] font-semibold leading-[2.8rem]  text-text-primary">
                    ShareTube
                </p>
                <div className="m-0 flex items-center p-0 text-text-primary">
                    <Button onClick={copyLink} title="Copy room link">
                        <Share />
                    </Button>
                    <div
                        className="flex items-center"
                        title={isExpanded ? "Hide room" : "Show room"}
                        onClick={toggleExpand}
                    >
                        <Button>
                            <Members />
                        </Button>
                        <p className="m-[0_0_-2px] p-0 text-text-primary font-primary leading-[1.6rem] text-[1.4rem] font-semibold hover:cursor-pointer select-none">
                            {userCount > 0 && `Members (${userCount})`}
                        </p>
                        <Button>
                            <Expand isExpanded={isExpanded} />
                        </Button>
                    </div>
                </div>
            </header>
            <div
                className={`${isExpanded ? "block" : "hidden"} bg-background-primary border-b border-solid border-spec-outline border-t-0 border-l-0 border-r-0`}
            >
                <MemberList callback={setUserCount} />
            </div>
            <div className="flex-grow overflow-y-auto">
                <Playlist />
            </div>
        </div>
    );
};

export default Panel;
