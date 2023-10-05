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
import {useSelector} from "react-redux";

const columnData = [
    {type: ColumnType.HOME, icon: <BiSolidHome className="h-8 w-8"/>, description: "The Default Following Feed of an account"},
    {type: ColumnType.FEED, icon: <ImFeed className="h-8 w-8"/>, description: "A saved feed, or enter the feed url / uri"},
    {type: ColumnType.NOTIFS, icon: <div className="grid place-items-center h-8 w-8"><BsFillBellFill className="h-6 w-6"/></div>, description: "Filterable notifications from your accounts"},
    {type: ColumnType.USERS, icon: <PiUserListBold className="h-8 w-8"/>, description: "A list of users saved locally, nobody else can see this list"},
    {type: ColumnType.SEARCH, icon: <BiSearchAlt className="h-8 w-8"/>, description: "Use the built-in search feature to find posts"},
    {type: ColumnType.FIREHOSE, icon: <BsFillLightningChargeFill className="h-8 w-8"/>, description: "The Firehose of incoming posts, with a custom filter"},
];

export default function PopupColumnPickType({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {

    const [openPopupState, setOpenPopupState] = useState<PopupConfig|false>(false);

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-2xl text-black">
        <PopupUserList
            isOpen={openPopupState && openPopupState.state === PopupState.USERS}
            setOpen={setOpenPopupState}
            popupConfig={openPopupState && openPopupState.state === PopupState.USERS && openPopupState as PopupUsers}/>
        <div className="space-y-2">
            <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
                <span>Choose a Column Type to Add</span>
            </h1>
            <div>
                {
                    columnData.map((x,i) =>
                        <div key={x.type}
                             className={clsx(
                                 i === 0 && "rounded-t-2xl", i === columnData.length-1 && "rounded-b-2xl border-b",
                                 "flex place-items-center gap-2 hover:bg-yellow-300 bg-yellow-100 p-2 border-x border-t border-black",
                             )}
                             onClick={() => {
                                 switch (x.type) {
                                     case ColumnType.HOME: {
                                         setOpenPopupState({
                                             state: PopupState.USERS,
                                             title:"Select an Account to use with this Feed",
                                             selectCallback:(did) => {
                                                 console.log(did);
                                                 //    setOpenPopupState(false);
                                             }} as PopupUsers)
                                         break;
                                     }
                                 }
                             }}
                        >
                            <FaPlus className="h-4 w-4"/> {x.icon}
                            <div className="grow">
                                <div className="text-base font-semibold">{x.type.toString()}</div>
                                <div className="text-sm">{x.description}</div>
                            </div>
                        </div>)
                }
            </div>
        </div>

    </Popup>
}