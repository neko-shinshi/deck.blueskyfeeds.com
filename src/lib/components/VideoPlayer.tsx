import videojs from 'video.js';
import VideoJS from "@/lib/components/VideoJs";
import {useEffect, useRef} from "react";

export default function VideoPlayer({className, url, thumbnail, alt}:{className?:string, url:string, thumbnail?:string, alt?:string}) {
    const playerRef = useRef(null);
    useEffect(() => {
        videojs.log.level('off');
    }, []);

    const videoJsOptions = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        poster:thumbnail,
        suppressNotSupportedError:true,
        sources: [{
            src: url,
            type: 'video/mp4'
        }]
    };
    const handlePlayerReady = (player) => {
        playerRef.current = player;
        // You can handle player events here, for example:
        /*player.on('waiting', () => {
            console.log('player is waiting');
        });

        player.on('dispose', () => {
            console.log('player will dispose');
        });*/
    };

    {
        /*
        return <video
            className={className}
            src={url}
            poster={thumbnail}
            controls
        />
         */
    }
    return <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />

}