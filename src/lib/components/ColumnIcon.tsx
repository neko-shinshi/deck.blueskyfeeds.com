import {ColumnConfig, ColumnType} from "@/lib/utils/types-constants/column";
import {BsFillBellFill, BsListUl} from "react-icons/bs";
import {BiSolidHome} from "react-icons/bi";

export default function ColumnIcon ({config}:{config:ColumnConfig}) {
    if (config.icon) {
        return <img src={config.icon} />
    }

    switch (config.type) {
        case ColumnType.NOTIFS: {
            return <BsFillBellFill className="w-full h-full p-1"/>
        }

        case ColumnType.HOME: {
            return <BiSolidHome className="w-full h-full p-1"/>
        }

        default: {
            return <BsListUl className="w-full h-full p-1"/>
        }
    }

}