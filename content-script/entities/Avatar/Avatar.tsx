import React from "react";

interface AvatarProps {
    size?: "s" | "m" | "l";
    url: string;
    color: string;
    letter: string;
}

const Avatar: React.FC<AvatarProps> = ({ size = "s", url, letter, color }) => {
    const sizeClass =
        size === "l"
            ? "h-[112px] w-[112px]"
            : size === "m"
              ? "h-[40px] w-[40px]"
              : "h-[30px] w-[30px]";
    const letterClass =
        size === "l"
            ? "text-[52px] leading-[52px]"
            : size === "m"
              ? "text-[24px] leading-[24px]"
              : "text-[1.4rem]";

    if (url) {
        return (
            <div
                className={`relative rounded-full bg-cover bg-center bg-no-repeat ${sizeClass}`}
                style={{ backgroundImage: `url(${url})` }}
            >
                <div className="absolute border-solid rounded-full top-[-1px] left-[-1px] w-full h-full border border-spec-outline pointer-events-none"></div>
            </div>
        );
    }

    return (
        <div
            className={`rounded-full flex border border-solid border-spec-outline ${sizeClass}`}
            style={{ backgroundColor: color }}
        >
            <p className={`p-0 m-auto text-white font-secondary text-center ${letterClass}`}>
                {letter}
            </p>
        </div>
    );
};

export default Avatar;
