import VideoPlayer from "@/lib/components/VideoPlayer";
import Image from "next/image";

export default function ImageOrVideoPlayer ({scene}) {
    const {file, type} = scene;
    const image = `https://files.anianimals.moe/${file}.jpg`;
    const video = type == "v" && `https://files.anianimals.moe/${file}.mp4`;
    return <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video border-2 border-black">
        {type == "i" &&
            <div className="relative aspect-video">
                <Image unoptimized fill src={image} alt="Anime scene"/>
            </div>
        }
        {type == "v" &&
            <VideoPlayer url={video}
                         thumbnail={image}
                         className="aspect-video absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-0"/>}
    </div>
}