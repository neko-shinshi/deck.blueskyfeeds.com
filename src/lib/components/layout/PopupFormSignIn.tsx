import FormSignIn from "@/lib/components/layout/FormSignIn";
import Popup from "@/lib/components/layout/Popup";
import {useEffect, useRef} from "react";

export default function PopupSignIn({isOpen, setOpen}) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref && isOpen) {
            ref.current.reset();
        }
    }, [isOpen]);

    return <Popup isOpen={isOpen} setOpen={setOpen}>
        <FormSignIn ref={ref}/>
    </Popup>
}