import Popup from "@/lib/components/popups/Popup";
import {useDispatch, useSelector} from "react-redux";
import clsx from "clsx";
import {exportJSON} from "@/lib/utils/redux/store";
import {useState} from "react";
import {initialState as configInitialState, resetConfig, setConfigValue} from "@/lib/utils/redux/slices/config";
import {makeInitialState as makePageInitialState, resetProfiles} from "@/lib/utils/redux/slices/storage";
import {resetMemory} from "@/lib/utils/redux/slices/memory";
import PopupConfirmation from "@/lib/components/popups/PopupConfirmation";
import {MdDeleteForever} from "react-icons/md";
import recoverDataFromJson from "@/lib/utils/client/recoverDataFromJson";
import PopupPageList from "@/lib/components/popups/PopupPageList";

export default function PopupGlobalSettings(
    {isOpen, setOpen}: {isOpen:boolean,setOpen:any}) {
    const dispatch = useDispatch();
    const [busy, setBusy] = useState(false);
    const [popupType, setPopupType] = useState<"confirm"|"page"|false>(false)

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-5/12 text-black space-y-2">

        <PopupConfirmation
            isOpen={popupType === "confirm"}
            setOpen={setPopupType}
            title="Remove All Accounts and Return to Login page?"
            message=""
            yesCallback={ async () => {
                dispatch(resetConfig(configInitialState));
                dispatch(resetProfiles(makePageInitialState()));
                dispatch(resetMemory());

            }}/>

        <PopupPageList isOpen={popupType === "page"} setOpen={setPopupType}/>

        <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
            <span>Settings</span>
        </h1>

        <button
            type="button"
            className={clsx("w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm",
                "text-sm font-medium text-white",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500")
            }
            onClick={() => setPopupType("page")}
        >
            Switch Page
        </button>


        <button
            type="button"
            className={clsx("w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm",
                "text-sm font-medium text-white",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500")
            }
            onClick={ async () => {
                if (!busy) {
                    setBusy(true);
                    const json = await exportJSON();
                    console.log(json);

                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute("href", dataStr);
                    dlAnchorElem.setAttribute("download", `deck-config.json`);
                    dlAnchorElem.click();

                    setBusy(false);
                }

            }}
        >
            Download JSON Config Backup
        </button>

        <button
            type="button"
            className={clsx("w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm",
                "text-sm font-medium text-white",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500")
            }
            onClick={() => recoverDataFromJson(dispatch)}
        >
            Recover from JSON Backup
        </button>




        <div className="flex justify-end">
            <button
                type="button"
                className={clsx("flex justify-center place-items-center h-10 p-2 border border-transparent rounded-md shadow-sm",
                    "text-sm font-medium text-white",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    "bg-red-600 hover:bg-red-700 focus:ring-red-500")
                }
                onClick={ async () => setPopupType("confirm")}
            >
                <MdDeleteForever className="w-6 h-6"/>
                Delete Data & Reset
            </button>
        </div>




    </Popup>
}