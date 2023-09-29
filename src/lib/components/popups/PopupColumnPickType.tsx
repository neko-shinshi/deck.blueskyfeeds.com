import Popup from "@/lib/components/popups/Popup";
import {ColumnType} from "@/lib/utils/types-constants/column";

const columnData = [
    {type: ColumnType.HOME},
    {type: ColumnType.FEED},
    {type: ColumnType.SEARCH}
]


export enum ColumnType {
    HOME = "Home",
    FEED = "Custom Feed",
    NOTIFS = "Notifications",
    USERS = "User List",
    SEARCH = "Search",
    FIREHOSE = "Firehose"
}

export default function PopupColumnPickType({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {
    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-5/12 text-black space-y-2">
        <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
            <span>Choose a Column Type to Add</span>
        </h1>
        {
            columnData.map(x => <div key={x.type}>

            </div>)
        }
    </Popup>
}