import {ColumnFeed, ColumnType} from "@/lib/utils/types-constants/column";
import {BsFillBellFill, BsListUl} from "react-icons/bs";
import {BiSolidHome} from "react-icons/bi";
import {useSelector} from "react-redux";
import Image from "next/image";
import {StoreState} from "@/lib/utils/redux/store";

export default function ColumnIcon ({columnId}:{columnId:string}) {
    const src = useSelector((state:StoreState) => {
        const config = state.storage.columns[columnId];
        const icon = config.icon;
        if (icon) {return icon;}
        if (config.type === ColumnType.FEED) {
            return state.memory.feeds[(config as ColumnFeed).uri]?.avatar;
        }
    });

    const configType = useSelector((state:StoreState) => state.storage.columns[columnId].type);
    if (src) {
        return <Image unoptimized fill src={src} className="overflow-hidden rounded-full" alt="Column Icon"/>
    }

    switch (configType) {
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