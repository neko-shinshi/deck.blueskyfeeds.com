import {Dialog} from "@headlessui/react";
import clsx from "clsx";
import React, {useRef, useState} from "react";
import {hasConsentCookie, setConsentCookie} from "@/lib/utils/cookies";
import Popup from "@/lib/components/layout/Popup";
import Toggle from "@/lib/components/input/Toggle";


export default function PopupCookieBanner({isOpen, setOpen,}: {
    isOpen:boolean
    setOpen:(boolean) => void,
}) {
    const [consent, setConsent] = useState({
        preference:false,
        analytics:false
    });
    const [dirty, setDirty] = useState(false);
    const reloadConsent = () => {
        setConsent(consent);
        setDirty(true);
    };
    let completeButtonRef = useRef(null)


    return <Popup isOpen={isOpen}
                  setOpen={open => {
                      setOpen(open);
                      console.log(`SetOpen(${open})`)
                  }}
                  preventManualEscape={!hasConsentCookie()}
                  initialFocus={completeButtonRef }
                  onCloseCallback={undefined}>
        <div className="bg-white max-w-lg rounded-xl p-4">
            <div className="text-center space-y-4" >
                <Dialog.Title as="h3" className="text-xl leading-6 font-medium text-gray-900 ">
                    We value your privacy
                </Dialog.Title>
                <Dialog.Description className="text-md text-gray-700 text-left">
                    We use cookies to improve your user experience. Please choose what cookies you allow us to use. <br/>By making a selection, you consent to our use of cookies according to our <a className="text-blue-500" href="https://static.anianimals.moe/privacy-policy.pdf">Privacy Policy</a>.
                </Dialog.Description>
                <div className="mt-2 space-y-4">
                    <Toggle text="Necessary Cookies"
                            disabled={true}
                            initialState={true}/>
                    <Toggle text="Preference Cookies"
                            initialState={consent.preference}
                            stateCallback={state => {
                                consent.preference = state;
                                reloadConsent();
                            }}/>
                    <Toggle text="Analytical Cookies"
                            initialState={consent.analytics}
                            stateCallback={state => {
                                consent.analytics = state;
                                reloadConsent();
                            }}/>
                </div>
            </div>
            <div className="mt-5 flex justify-between space-x-4">
                <button
                    type="button"
                    className={clsx( "bg-white hover:bg-black hover:text-white sm:mt-0 sm:col-start-1 sm:text-sm",
                        "mt-3 w-full inline-flex justify-center items-center rounded-md border border-2 shadow-sm px-4 py-2 text-gray-700 font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black")}
                    onClick={() => {
                        setOpen(false);
                        setConsentCookie(consent);
                    }}
                >
                    {dirty? "Accept Selected" : "Decline Non-Necessary"}
                </button>
                <button
                    type="button"
                    ref={completeButtonRef}
                    className={clsx("mt-3 w-full inline-flex justify-center items-center rounded-md border border-2 border-black",
                        "shadow-sm px-4 py-2 bg-white font-medium text-gray-700 sm:mt-0 sm:col-start-1 sm:text-sm",
                        "hover:bg-black hover:text-white",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black")}
                    onClick={() => {
                        setOpen(false);
                        setConsentCookie({
                            preferences:true,
                            analytics:true
                        });
                    }}
                >
                    Accept All
                </button>
            </div>
        </div>
    </Popup>
}
