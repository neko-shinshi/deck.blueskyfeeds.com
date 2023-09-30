import Popup from "@/lib/components/popups/Popup";
import clsx from "clsx";
import FormSignIn from "@/lib/components/FormSignIn";
import {UserData} from "@/lib/utils/redux/slices/users";

export default function PopupFormSignIn({isOpen, setOpen, initialUser=null, completeCallback}:
        {isOpen:boolean, setOpen:any, initialUser?: UserData, completeCallback?:any}) {
    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className={clsx("bg-white rounded-lg",
            "px-4 pt-5 pb-4 sm:p-6",
            "text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ")}
    >
        <FormSignIn
            openState={isOpen}
            initialUser={initialUser}
            completeCallback={() => {
                setOpen(false);
                if (completeCallback) {
                    completeCallback();
                }
            }}/>
    </Popup>
}