import {ColumnConfig, ColumnFeed, ColumnType} from "@/lib/utils/types-constants/column";
import {BsFillBellFill, BsListUl} from "react-icons/bs";
import {BiSolidHome} from "react-icons/bi";
import {useSelector} from "react-redux";
import Image from "next/image";
import {StoreState} from "@/lib/utils/redux/store";

export default function ColumnIcon ({config}:{config:ColumnConfig}) {
    const feeds = useSelector((state:StoreState) => state.memory.feeds);
    //@ts-ignore
    if (config.icon) {
        return <Image unoptimized fill src={config.icon} className="overflow-hidden rounded-full" alt="Column Icon"/>
    } else if (config.type === ColumnType.FEED && feeds[(config as ColumnFeed).uri]?.avatar) {
        return <Image unoptimized fill src={feeds[(config as ColumnFeed).uri]?.avatar} className="overflow-hidden rounded-full" alt="Column Icon"/>
    }

    switch (config.type) {
        case ColumnType.NOTIFS: {
            return <BsFillBellFill className="w-full h-full p-1 text-theme_dark-I0"/>
        }

        case ColumnType.HOME: {
            return <BiSolidHome className="w-full h-full p-1 text-theme_dark-I0"/>
        }

        default: {
            return <BsListUl className="w-full h-full p-1 text-theme_dark-I0"/>
        }
    }

}