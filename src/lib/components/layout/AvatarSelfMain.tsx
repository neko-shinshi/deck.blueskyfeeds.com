import Image from "next/image";
import clsx from "clsx";

const title = "My Image";
export default function AvatarSelfMain ({avatar, onClick, className}) {
    return <div className={clsx(className, "hover:blur-xs relative")} onClick={onClick}>
        {
            avatar? <Image
                unoptimized fill
                src={avatar}
                className="rounded-full text-transparent"
                alt={title}
            />: <svg viewBox="0 0 24 24" fill="none" stroke="none">
                <title>{title}</title>
                <circle cx="12" cy="12" r="12" fill="#0070ff"></circle>
                <circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path>
            </svg>
        }
    </div>
}