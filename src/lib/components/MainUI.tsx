import SectionControls from "@/lib/components/SectionControls";
import SectionColumns from "@/lib/components/SectionColumns";
import {arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/storage";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {StoreState} from "@/lib/utils/redux/store";

export default function MainUI({}) {
    const currentProfile = useSelector((state:StoreState) => state.local.currentProfile);
    const columnIds = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        if (!currentProfile) {
            return [];
        }
        return state.storage.profiles[currentProfile].columnIds;
    }, shallowEqual);

    const dispatch = useDispatch();

    function handleColumnDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            console.log("old", columnIds);
            const oldIndex = columnIds.indexOf(active.id);
            const newIndex = columnIds.indexOf(over.id);

            const result = arrayMove(columnIds, oldIndex, newIndex);
            console.log("new", result);
            dispatch(setColumnOrder({order:result, profileId: currentProfile}));
        }
    }

    return <div className="w-full h-full flex pr-2 py-0.5">
        <SectionControls handleColumnDragEnd={handleColumnDragEnd}/>
        <SectionColumns handleColumnDragEnd={handleColumnDragEnd}/>
    </div>
}