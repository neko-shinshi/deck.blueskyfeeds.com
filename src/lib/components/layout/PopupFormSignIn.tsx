import Popup from "@/lib/components/layout/Popup";
import {useEffect, useRef} from "react";
import clsx from "clsx";
import FormSignIn from "@/lib/components/layout/FormSignIn";

export default function PopupFormSignIn({isOpen, setOpen, initialUser=""}) {
    const ref = useRef(null);
    useEffect( () => {
        if (ref.current && isOpen) {
            ref.current.resetForm (initialUser);
        }
    }, [isOpen, ref, initialUser]);

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className={clsx("bg-white rounded-lg",
            "px-4 pt-5 pb-4 sm:p-6",
            "text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full ")}
    >
        <FormSignIn ref={ref} signInCallback={() => {
            if (initialUser) {
                setOpen(false);
            } else {
                setOpen("users")
            }
        }}/>
    </Popup>
}