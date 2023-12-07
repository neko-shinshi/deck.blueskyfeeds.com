import Popup from "@/lib/components/popups/Popup";
import {ColumnType} from "@/lib/utils/types-constants/column";
import {BiSearchAlt, BiSolidHome} from "react-icons/bi";
import {ImFeed} from "react-icons/im";
import {PiUserListBold} from "react-icons/pi";
import {BsFillBellFill, BsFillLightningChargeFill} from "react-icons/bs";
import {FaPlus} from "react-icons/fa";
import clsx from "clsx";
import {useState} from "react";
import {PopupConfig, PopupState, PopupUsers} from "@/lib/components/SectionControls";
import {addColumn} from "@/lib/utils/redux/slices/pages";
import {useDispatch, useSelector} from "react-redux";
import {randomUuid} from "@/lib/utils/random";
import AvatarUser from "@/lib/components/AvatarUser";

const columnData = [
    {type: ColumnType.HOME, icon: <BiSolidHome className="h-6 w-6"/>, description: "The Default Following Feed of an account"},
    {type: ColumnType.FEED, icon: <ImFeed className="h-6 w-6"/>, description: "A saved feed, or enter the feed url / uri"},
    {type: ColumnType.NOTIFS, icon: <div className="grid place-items-center h-6 w-6"><BsFillBellFill className="h-6 w-6"/></div>, description: "Filterable notifications from your accounts"},
    {type: ColumnType.USERS, icon: <PiUserListBold className="h-6 w-6"/>, description: "A list of users from a Public Bluesky List or a Private list"},
    {type: ColumnType.SEARCH, icon: <BiSearchAlt className="h-6 w-6"/>, description: "Use the built-in search feature to follow posts with keywords"},
];

export default function PopupColumnPickType({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);

    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);

    const dispatch = useDispatch();

    const TypeButton = ({x}) => {
        const [expanded, setExpanded] = useState<false | ColumnType>(false);
        return <div key={x.type}
                    className={clsx(" p-1.5",)}
        >
            <div className="flex place-items-center gap-2 hover:bg-gray-700" onClick={() => {
                if (expanded === x.type) {
                    setExpanded(false);
                } else {
                    setExpanded(x.type);
                }
            }}>
                <FaPlus className="h-4 w-4"/> {x.icon}
                <div className="grow">
                    <div className="text-sm font-semibold">{x.type.toString()}</div>
                    <div className="text-xs">{x.description}</div>
                </div>
            </div>

            {
                expanded === x.type && x.type === ColumnType.HOME && <>
                    {
                        accounts.order.reduce((acc, id) => {
                            const account = accounts.dict[id];
                            if (account) {
                                acc.push(<div
                                    key={id}
                                    className="bg-theme_dark-L0 hover:bg-gray-700 flex place-items-center gap-2 ml-4 p-0.5"
                                    onClick={() => {
                                        const homeId = randomUuid();
                                        const b = {pageId:config.currentPage, name:`Home`, config:{id:homeId, type:ColumnType.HOME, observer: id}, defaults: config};
                                        dispatch(addColumn(b));
                                        setOpen(false);
                                    }}
                                >
                                    <div className="w-6 h-6 relative aspect-square">
                                        <AvatarUser avatar={account.avatar} alt={account.displayName}/>
                                    </div>
                                    <div>
                                        <div className="text-sm text-theme_dark-T0">{account.displayName}</div>
                                        <div className="text-xs text-theme_dark-T1">@{account.handle}</div>
                                    </div>
                                </div>)
                            }

                            return acc;
                        }, [])
                    }
                </>
            }
        </div>
    }


    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-theme_dark-L1 rounded-2xl text-black text-theme_dark-T1">
        <h1 className="text-center text-base font-semibold text-theme_dark-T0 p-2">
            <span>Choose a Column Type to Add</span>
        </h1>
        <div>
            {
                columnData.map((x,i) => <TypeButton key={x.type} x={x}/>)
            }
        </div>

    </Popup>
}