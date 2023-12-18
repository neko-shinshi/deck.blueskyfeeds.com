import {makeKey} from "@/lib/utils/crypto";
import {setConfigValue} from "@/lib/utils/redux/slices/config";
import {resetProfiles} from "@/lib/utils/redux/slices/profiles";
import {initializeColumn, updateMemory} from "@/lib/utils/redux/slices/memory";

export default function recoverDataFromJson (dispatch) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "application/json"
    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = async (readerEvent) => {
            try {
                const content = JSON.parse(readerEvent.target.result as string);
                console.log(content);
                let {config, pages, users} = content;
                config.basicKey = await makeKey();
                dispatch(setConfigValue(config));
                dispatch(resetProfiles(pages));
                dispatch(updateMemory({mode:"main"}));

                const ids = Object.keys(pages.columnDict);
                if (ids.length > 0) {
                    dispatch(initializeColumn({ids}));
                }

                alert("Your settings have been restored. Login to each account again to use logged in features");
            } catch (e) {
                console.log(e);
                alert("error recovering data");
            }
        }
    }
    input.click();
}