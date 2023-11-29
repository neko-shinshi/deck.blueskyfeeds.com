import {updateMemory} from "@/lib/utils/redux/slices/memory";
import {BiArrowBack} from "react-icons/bi";
import {ColumnConfig, FetchedColumn} from "@/lib/utils/types-constants/column";
import {useSelector, useDispatch} from "react-redux";
import {HiChevronLeft, HiChevronRight} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {setColumnOrder, updateColumn} from "@/lib/utils/redux/slices/pages";
import {arrayMove} from "@dnd-kit/sortable";
import {useRef, useState} from "react";
import {FaMinus, FaPlus} from "react-icons/fa";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";
import {RiCheckboxBlankCircleLine, RiCheckboxCircleFill, RiCheckboxCircleLine} from "react-icons/ri";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";

export default function ColumnSettings ({column}:{column:ColumnConfig}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);

    const dispatch = useDispatch();
    const [sliderVal, setSliderVal] = useState(column.width);

    const changeOrder = (diff) => {
        let columnIds = pages.pages.dict[config.currentPage].columns.filter(colId => pages.columnDict[colId]);
        const oldIndex = columnIds.indexOf(column.id);
        if (oldIndex < 0) {console.log("can't find column"); return;}
        let newIndex = oldIndex + diff;
        if (newIndex < 0) {console.log("far left"); return;}
        const result = arrayMove(columnIds, oldIndex, newIndex);
        dispatch(setColumnOrder({order:result, pageId: config.currentPage}));
    }
    const dispatchSliderVal = (val) => {
        if (!isNaN(val)) {
            dispatch(updateColumn({columnId: column.id, key:"width", val}));
        } else {
            dispatch(updateColumn({columnId: column.id, key:"width", val: sliderVal}));
        }
    }

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
            Settings - {column.name}
        </div>
        <div className="space-y-4 p-2">
            <div>
                <div>Column Name</div>
                <div className="flex">
                    <input type="text" className="w-full rounded-md h-6"/><button>Update</button>
                </div>
            </div>

            <div>
                <div>Column Width ({sliderVal})</div>
                <div className="flex place-items-center gap-2">
                    <button type="button"
                            className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-lg mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                            onClick={() => {
                                const v = Math.max((sliderVal*10-1)/10, 18);
                                setSliderVal(v);
                                dispatchSliderVal(v);
                            }}
                    >
                        <FaMinus className="w-4 h-4" />
                    </button>
                    <input
                        className="w-full h-2 rounded-lg cursor-pointer accent-red-700"
                        type="range" min="20" max="26" step="0.1" defaultValue={column.width}
                        onMouseUp={dispatchSliderVal} onTouchEnd={dispatchSliderVal}
                        onChange={(evt) => setSliderVal(parseFloat(evt.target.value))}/>
                    <button type="button"
                            className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-lg mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                            onClick={() => {
                                const v = Math.min((sliderVal*10+1)/10, 26);
                                setSliderVal(v);
                                dispatchSliderVal(v);
                            }}
                    >
                        <FaPlus className="w-4 h-4" />
                    </button>

                </div>

            </div>

            <div>
                <div>Thumbnail Size</div>
                <div className="flex flex-wrap gap-2">
                    {
                        (Object.values(ThumbnailSize)).map(v => {
                            return <div key={v}
                                        className="bg-theme_dark-L1 hover:bg-gray-700 p-1 rounded-xl flex place-items-center gap-1"
                                        onClick={() => {
                                            if (column.thumbnailSize.toString() !== v) {
                                                dispatch(updateColumn({columnId: column.id, key:"thumbnailSize", val:v}));
                                            }
                                        }}
                            >
                                {
                                    column.thumbnailSize.toString() === v?
                                        <RiCheckboxCircleFill className="w-4 h-4"/>:
                                        <RiCheckboxBlankCircleLine className="w-4 h-4"/>
                                }
                                <div>{v}</div>
                            </div>
                        })
                    }
                </div>
            </div>

            {
                'refreshMs' in column &&
                <div>
                    <div>Refresh Rate</div>
                    <div className="flex flex-wrap gap-2">
                        {
                            (Object.keys(RefreshTimingType)).filter(v => isNaN(Number(v))).map(v => {
                                const col = column as FetchedColumn;

                                return <div key={v} className="bg-theme_dark-L1 hover:bg-gray-700 p-1 rounded-xl flex place-items-center gap-1"
                                            onClick={() => {
                                                if (col.refreshMs !== RefreshTimingType[v]) {
                                                    dispatch(updateColumn({columnId: column.id, key:"refreshMs", val:RefreshTimingType[v]}));
                                                }
                                            }}>
                                    {
                                        col.refreshMs === RefreshTimingType[v]?
                                            <RiCheckboxCircleFill className="w-4 h-4"/>:
                                            <RiCheckboxBlankCircleLine className="w-4 h-4"/>
                                    }

                                    <div>{v}</div>
                                </div>
                            })
                        }
                    </div>
                </div>
            }


            <div className="flex justify-between p-2">
                <div className="flex gap-2">
                    <div className="border border-theme_dark-I0 rounded-full hover:bg-theme_dark-I2 bg-theme_dark-I1 text-theme_dark-I0"
                         onClick={() => changeOrder(-1)}
                    >
                        <HiChevronLeft className="w-8 h-8"/>
                    </div>
                    <div className="border border-theme_dark-I0 rounded-full hover:bg-theme_dark-I2 bg-theme_dark-I1 text-theme_dark-I0"
                         onClick={() => changeOrder(1)}
                    >
                        <HiChevronRight className="w-8 h-8"/>
                    </div>
                </div>
                <div className="flex place-items-center text-red-500 hover:text-red-600"
                     onClick={() => {

                     }}
                >
                    <MdDeleteForever className="w-8 h-8"/>
                    <div>Delete</div>
                </div>
            </div>
        </div>


    </>
}