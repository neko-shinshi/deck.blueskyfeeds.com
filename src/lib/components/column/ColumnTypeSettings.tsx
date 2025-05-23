import {BiArrowBack, BiArrowToLeft} from "react-icons/bi";
import {
    ColumnConfig, ColumnFeed,
    ColumnType,
    FetchedColumn,
    MAX_WIDTH,
    MIN_WIDTH
} from "@/lib/utils/types-constants/column";
import {useDispatch, useSelector} from "react-redux";
import {HiChevronLeft, HiChevronRight} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {removeColumn, setColumnOrder, updateColumn} from "@/lib/utils/redux/slices/storage";
import {arrayMove} from "@dnd-kit/sortable";
import {useRef, useState} from "react";
import {FaMinus, FaPlus} from "react-icons/fa";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";
import {RiCheckboxBlankCircleLine, RiCheckboxCircleFill} from "react-icons/ri";
import {RefreshTimingType} from "@/lib/utils/types-constants/refresh-timings";
import clsx from "clsx";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {AccountType, BlueskyAccount, getUserName, MastodonAccount} from "@/lib/utils/types-constants/user-data";
import {StoreState} from "@/lib/utils/redux/store";
import {updateColumnMode} from "@/lib/utils/redux/slices/memory";
import ColumnBackButtons from "@/lib/components/column/ColumnBackButtons";

export default function ColumnTypeSettings ({columnId}:{columnId:string}) {
    const column = useSelector((state:StoreState) => state.storage.columns[columnId]);
    const currentProfile =  useSelector((state:StoreState) => state.local.currentProfile);
    const observerAccounts:(BlueskyAccount|MastodonAccount)[] = useSelector((state:StoreState) => {
        return state.storage.columns[columnId].observers.reduce((acc, x) => {
            const account = state.memory.accountData[x];
            if (account && account.type === AccountType.BLUESKY) {
                acc.push(account);
            }
            return acc;
        }, []);
    });
    const columnIds = useSelector((state:StoreState) =>
        state.storage.profiles[currentProfile].columnIds.filter(colId => state.storage.columns[colId]))

    const parentMode = useSelector((state:StoreState) => state.memory.columnMode[columnId].parent);
    const columnName = useSelector((state:StoreState) => {
        const config = state.storage.columns[columnId];
        return config.name || (config.type === ColumnType.FEED && state.memory.feeds[(config as ColumnFeed).uri]?.displayName);
    });


    const dispatch = useDispatch();
    const [sliderVal, setSliderVal] = useState(column.width);

    const nameRef = useRef(null);

    const changeOrder = (diff) => {
        const oldIndex = columnIds.indexOf(columnId);
        if (oldIndex < 0) {console.log("can't find column"); return;}
        let newIndex = oldIndex + diff;
        if (newIndex < 0) {console.log("far left"); return;}
        const result = arrayMove(columnIds, oldIndex, newIndex);
        dispatch(setColumnOrder({order:result, profileId: currentProfile}));
    }
    const dispatchSliderVal = (val) => {
        if (!isNaN(val)) {
            dispatch(updateColumn({columnId: column.id, key:"width", val}));
        } else {
            dispatch(updateColumn({columnId: column.id, key:"width", val: sliderVal}));
        }
    }

    return <>
        <div className="h-[3rem] flex place-items-center gap-1 justify-start">
            <ColumnBackButtons parentMode={parentMode} columnId={columnId} />
            <div>Settings - {columnName}</div>
        </div>

        <div className="space-y-2 p-2 bg-theme_dark-L1 rounded-md">
            <div className="flex justify-between place-items-center">
                <div className="flex gap-2 place-items-center">
                    <div className="font-bold">Move Column</div>
                    {
                        columnIds.indexOf(columnId) > 0 &&
                        <div className={clsx("border border-theme_dark-I0 rounded-full text-theme_dark-I0",
                            "hover:bg-theme_dark-I2 bg-theme_dark-I1")}
                             onClick={() => changeOrder(-1)}
                        >
                            <HiChevronLeft className="w-6 h-6"/>
                        </div>

                    }
                    {
                        columnIds.indexOf(columnId) < columnIds.length - 1 &&
                        <div className={clsx("border border-theme_dark-I0 rounded-full text-theme_dark-I0",
                            "hover:bg-theme_dark-I2 bg-theme_dark-I1")}
                             onClick={() => changeOrder(1)}
                        >
                            <HiChevronRight className="w-6 h-6"/>
                        </div>
                    }
                </div>
                <div className="flex place-items-center text-red-500 hover:text-red-600 hover:bg-theme_dark-I2 rounded-md p-1 select-none"
                     onClick={() => {
                         dispatch(removeColumn({columnId}));
                     }}
                >
                    <MdDeleteForever className="w-6 h-6"/>
                    <div className="font-bold">Delete Column</div>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="font-bold">Column Name</div>
                    <div className="flex place-items-cente gap-2">
                        <input type="text"
                               ref={nameRef}
                               className="w-full rounded-md p-1"
                               placeholder="New name here"/>
                        <button type="button"
                                className="hover:bg-theme_dark-I2 rounded-md p-0.5"
                                onClick={() => {
                                    const name = nameRef.current.value;
                                    if (name.trim()) {
                                        console.log(name);
                                        dispatch(updateColumn({columnId, key:"name", val:name}));
                                    }
                                }}>Update</button>
                    </div>
                </div>

                <div>
                    <div className="font-bold">Column Icon</div>
                </div>

                <div className={clsx(column.observers.length === 1 && "flex place-items-center gap-2")}>
                    <div className="font-bold">Column Account{column.type === ColumnType.NOTIFS && "s"}</div>
                    {
                        observerAccounts.map(account =>
                            <div key={account.id} className="flex gap-1 grow-0 overflow-hidden place-items-center group">
                                <div className={clsx("w-4 h-4", "relative aspect-square rounded-full border border-theme_dark-I0")}>
                                    <AvatarUser avatar={account.avatar}
                                                alt={getUserName(account)}/>
                                </div>
                                <div
                                    className="overflow-hidden text-theme_dark-T1 text-xs group-hover:underline">{account.handle}</div>
                            </div>)
                    }
                </div>

                <div>
                    <div className="font-bold">Column Width ({sliderVal})</div>
                    <div className="flex place-items-center gap-2">
                        <button type="button"
                                className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-lg mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                                onClick={() => {
                                    const v = Math.max((sliderVal*10-1)/10, MIN_WIDTH);
                                    setSliderVal(v);
                                    dispatchSliderVal(v);
                                }}
                        >
                            <FaMinus className="w-4 h-4" />
                        </button>
                        <input
                            key={column.width}
                            className="w-full h-2 rounded-lg cursor-pointer accent-red-700"
                            type="range" min={MIN_WIDTH} max={MAX_WIDTH} step="0.1" defaultValue={column.width}
                            onMouseUp={dispatchSliderVal} onTouchEnd={dispatchSliderVal}
                            onChange={(evt) => setSliderVal(parseFloat(evt.target.value))}/>
                        <button type="button"
                                className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-lg mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                                onClick={() => {
                                    const v = Math.min((sliderVal*10+1)/10, MAX_WIDTH);
                                    setSliderVal(v);
                                    dispatchSliderVal(v);
                                }}
                        >
                            <FaPlus className="w-4 h-4" />
                        </button>

                    </div>

                </div>

                <div>
                    <div className="font-bold">Thumbnail Size</div>
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
                        <div className="font-bold">Refresh Rate</div>
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
            </div>

        </div>


    </>
}