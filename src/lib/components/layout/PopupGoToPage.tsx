import {useRouter} from "next/router";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import Popup from "@/lib/components/layout/Popup";
import {paramsToEncodedString} from "@/lib/utils/network";
import InputTextButton from "@/lib/components/input/InputTextButton";

export default function PopupGoToPage(
    {
        isOpen,
        setOpen,
        max,
        pageOnePath,
        basePath,
        currentPage,
        params={}
    }: {
        isOpen:boolean
        setOpen:(boolean) => void,
        max:number
        pageOnePath:string
        basePath:string
        currentPage:number,
        params
    }) {

    const router = useRouter();
    const useFormReturn = useForm({mode:"all"});
    const {
        getValues,
        setError,
        trigger,
        handleSubmit,
        reset,
    } = useFormReturn;

    useEffect(() => {
        reset({page:currentPage});
    }, [currentPage, isOpen]);

    return <Popup className="w-52"
                  isOpen={isOpen}
                  setOpen={setOpen}
                  preventManualEscape={false}>
        <div className="bg-blue-200 rounded-xl p-4">
            <form onSubmit={async (e) => {
                console.log("submit");
                await trigger();

                handleSubmit(async (data) => {
                    const val = parseInt(getValues("page"));
                    if (val && !isNaN(val) && val > 0 && val <= max) {
                        if (val == 1) {
                            await router.push(`${pageOnePath}${paramsToEncodedString(params)}`);
                        } else {
                            await router.push(`${basePath}/${val}${paramsToEncodedString(params)}`);
                        }
                        setOpen(false);
                    } else {
                        setError("page", {type:"custom", message:"Invalid Page Number"});
                    }
                })(e).catch(err => {
                    console.log(err);
                });
            }}>
                <InputTextButton
                    specialType="number"
                    fieldName="page"
                    classNameLabel="text-md text-black font-bold ml-2 mb-2"
                    fieldReadableName="Jump To Page"
                    options={{
                        pattern: {
                            value: /^[0-9]+$/,
                            message: 'Invalid Page Number',
                        },
                    }}
                    useFormReturn={useFormReturn}
                    optional={false}
                    placeholder="Page Number"
                    buttonText="Go"
                    isButtonSubmit={true}
                    buttonCallback={undefined}/>
            </form>
            <div className="text-center w-full mt-4">{currentPage} / {max}</div>
        </div>
    </Popup>

}