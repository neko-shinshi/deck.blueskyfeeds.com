import {updateColumnMode} from "@/lib/utils/redux/slices/memory";
import {BiArrowBack, BiArrowToLeft} from "react-icons/bi";
import {useDispatch} from "react-redux";

export default function ColumnBackButtons({parentMode, columnId}) {
    const dispatch = useDispatch();

    return <>
        {
            parentMode &&
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     dispatch(updateColumnMode({colId: columnId, mode:null}));
                 }}
            >
                <BiArrowToLeft className="w-4 h-4 text-theme_dark-I0" />
            </div>
        }
        <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
             onClick={() => dispatch(updateColumnMode({colId: columnId, mode:parentMode}))}
        >
            <BiArrowBack className="w-4 h-4 text-theme_dark-I0" />
        </div>
    </>
}