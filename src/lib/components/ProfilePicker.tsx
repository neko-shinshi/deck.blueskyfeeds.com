import {FaArrowLeft, FaMastodon} from "react-icons/fa";
import {BsFiletypeJson} from "react-icons/bs";
import FormSignInBluesky from "@/lib/components/FormSignInBluesky";
import FormSignInMastodon from "@/lib/components/FormSignInMastodon";

export default function ProfilePicker () {




    return <div className="border-2 border-theme_dark-I0 rounded-xl bg-theme_dark-L1 text-2xl overflow-hidden">
        {
            mode === "root" && <>
                <div className="flex place-items-center p-3 hover:bg-theme_dark-I1 select-none"
                     onClick={() => setMode("bluesky")}
                >
                    <div className="p-1">
                        <div className="h-8 w-8 bg-gradient-to-b from-[#0066fe] to-[#0092fe] rounded-md" title="Bluesky">
                            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"
                                 viewBox="0 0 512 512" className="w-full h-full">
                                <path fill="white" d="M323,149l101,69c-19.258-6.153-94.991-49.079-104-38l-45,39-3-3-52-42-70,14,78-38,45,28ZM95,255l37,24,43-18,47,37-47-15c-60.012,29.651-38.1,24.5-83-10l-41,3Zm319,45,35,21v1l-37-5-20,16-19-15-45,18,2-3,41-31,19,13Zm-88,36h0Z"/>
                            </svg>
                        </div>
                    </div>
                    <div>Use Bluesky Account</div>
                </div>
                <div className="flex place-items-center p-3 hover:bg-theme_dark-I1 select-none"
                     onClick={() => setMode("mastodon")}
                >
                    <div className="relative h-10 w-10">
                        <div className="bg-white absolute right-2 bottom-4 left-2 top-2"/>
                        <FaMastodon className="h-10 w-10 text-[#563ACC] absolute" title="Mastdodon"/>
                    </div>

                    <div>Use Mastodon Account</div>
                </div>
                <div className="flex place-items-center p-3 hover:bg-theme_dark-I1 select-none"
                     onClick={async ()=> {
                         if (!busy) {
                             setBusy(true);

                             setBusy(false);
                         }
                     }}
                >
                    <BsFiletypeJson className="h-10 w-10 p-1"/>
                    <div>Recover from JSON</div>
                </div>
            </>
        }
        {
            mode === "bluesky" && <div className="p-4">
                <div className="flex place-items-center gap-2 hover:bg-theme_dark-I1 select-none w-fit p-1 rounded-md"
                     onClick={() => setMode("root")}
                >
                    <FaArrowLeft className="h-4 w-4"/>
                    <div className="text-lg">Back</div>
                </div>
                <FormSignInBluesky/>
            </div>
        }

        {
            mode === "mastodon" && <div className="p-4">
                <div className="flex place-items-center gap-2 hover:bg-theme_dark-I1 select-none w-fit p-1 rounded-md"
                     onClick={() => setMode("root")}
                >
                    <FaArrowLeft className="h-4 w-4"/>
                    <div className="text-lg">Back</div>
                </div>
                <FormSignInMastodon/>
            </div>
        }

    </div>
}