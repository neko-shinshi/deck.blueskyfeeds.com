import {useEffect, useState} from "react";
import Link from "next/link";
import {dateToReadableDateTime} from "@/lib/utils/date";
import {getLocalAnimeTitle} from "@/lib/utils/format";
import Image from "next/image";
import UserActions from "@/lib/components/UserActions";

export default function SceneWithUserActions ({scene, priority=false}) {
    const {_id, file, type} = scene;
    const href = `/scene/${_id}`;
    const image = `https://files.anianimals.moe/${file}.jpg`;
    const [delay, setDelay] = useState(false);

    useEffect(() => {
        setDelay(true);
    }, []);


    return <div className="bg-white w-full rounded-2xl overflow-hidden inner-border-2 inner-border-black h-full flex flex-col">
        <Link href={href}>
            <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video border-2 border-black">
                <Image unoptimized fill
                       priority={priority}
                       alt="scene"
                       src={image}/>
            </div>
        </Link>
        <div className="flex justify-between pl-4 pr-4 pt-2 pb-2 h-full">
            <div className="flex flex-col justify-between">
                <div className="font-bold">{getLocalAnimeTitle(scene)}</div>
                {
                    delay && <time className="text-neutral-500">{dateToReadableDateTime(scene.time)}</time>
                }

            </div>
            <UserActions href={href} sceneId={scene._id}/>

        </div>
    </div>
}