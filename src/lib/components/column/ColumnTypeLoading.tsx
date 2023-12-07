import {updateMemory} from "@/lib/utils/redux/slices/memory";
import {BiArrowBack} from "react-icons/bi";
import {useDispatch, useSelector} from "react-redux";
import {ColumnConfig, ColumnModeLoading} from "@/lib/utils/types-constants/column";

export default function ColumnTypeLoading({column}:{column:ColumnConfig}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();
    return <>
        <div className="h-[3rem] flex place-items-center gap-2 justify-start">
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     let command:any = {};
                     command[`columns.${column.id}.mode`] = memory.columns[column.id].mode.parent;
                     console.log(JSON.stringify(command, null,2 ))
                     dispatch(updateMemory(command));
                 }}
            >
                <BiArrowBack className="w-4 h-4 text-theme_dark-I0" />
            </div>
            <div>{memory.columns[column.id].mode.header}</div>
        </div>
        <div className="w-full h-full grid place-items-center">
            <div className="flex place-items-center gap-3 pt-5">
                <svg aria-hidden="true" className="inline w-10 h-10text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <div>Loading...</div>
            </div>
        </div>
    </>
}