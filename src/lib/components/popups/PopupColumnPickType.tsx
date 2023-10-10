import Popup from "@/lib/components/popups/Popup";
import {ColumnType} from "@/lib/utils/types-constants/column";
import {BiSearchAlt, BiSolidHome} from "react-icons/bi";
import {ImFeed} from "react-icons/im";
import {PiUserListBold} from "react-icons/pi";
import {BsFillBellFill, BsFillLightningChargeFill} from "react-icons/bs";
import {FaPlus} from "react-icons/fa";
import clsx from "clsx";
import PopupUserList from "@/lib/components/popups/PopupUserList";
import {useState} from "react";
import {PopupConfig, PopupState, PopupUsers} from "@/lib/components/MainControls";
import {addColumn} from "@/lib/utils/redux/slices/pages";
import {useDispatch, useSelector} from "react-redux";
import {randomUuid} from "@/lib/utils/random";

const columnData = [
    {type: ColumnType.HOME, icon: <BiSolidHome className="h-6 w-6"/>, description: "The Default Following Feed of an account"},
    {type: ColumnType.FEED, icon: <ImFeed className="h-6 w-6"/>, description: "A saved feed, or enter the feed url / uri"},
    {type: ColumnType.NOTIFS, icon: <div className="grid place-items-center h-6 w-6"><BsFillBellFill className="h-6 w-6"/></div>, description: "Filterable notifications from your accounts"},
    {type: ColumnType.USERS, icon: <PiUserListBold className="h-6 w-6"/>, description: "A list of users saved locally, nobody else can see this list"},
    {type: ColumnType.SEARCH, icon: <BiSearchAlt className="h-6 w-6"/>, description: "Use the built-in search feature to find posts"},
    {type: ColumnType.FIREHOSE, icon: <BsFillLightningChargeFill className="h-6 w-6"/>, description: "The Firehose of incoming posts, with a custom filter"},
];

export default function PopupColumnPickType({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {
    const [openPopupState, setOpenPopupState] = useState<PopupConfig|false>(false);
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-theme_dark-L1 rounded-2xl text-black text-theme_dark-T1">
        <PopupUserList
            isOpen={openPopupState && openPopupState.state === PopupState.USERS}
            setOpen={setOpenPopupState}
            popupConfig={openPopupState && openPopupState.state === PopupState.USERS && openPopupState as PopupUsers}/>
        <h1 className="text-center text-base font-semibold text-theme_dark-T0 p-2">
            <span>Choose a Column Type to Add</span>
        </h1>
        <div>
            {
                columnData.map((x,i) =>
                    <div key={x.type}
                         className={clsx(
                             "flex place-items-center gap-2 hover:bg-gray-700 p-1.5",
                         )}
                         onClick={() => {
                             switch (x.type) {
                                 case ColumnType.HOME: {
                                     setOpenPopupState({
                                         state: PopupState.USERS,
                                         title:"Select an Account to use with this Feed",
                                         selectCallback:(did) => {
                                             const homeId = randomUuid();
                                             const b = {pageId:config.currentPage, config:{id:homeId, type:ColumnType.HOME, observer: did}, defaults: config};
                                             console.log("b", b)
                                             dispatch(addColumn(b));
                                             setOpenPopupState(false);
                                         }} as PopupUsers)
                                     break;
                                 }
                                 case ColumnType.FEED: {

                                 }
                             }
                         }}
                    >
                        <FaPlus className="h-4 w-4"/> {x.icon}
                        <div className="grow">
                            <div className="text-sm font-semibold">{x.type.toString()}</div>
                            <div className="text-xs">{x.description}</div>
                        </div>
                    </div>)
            }
        </div>

    </Popup>
}