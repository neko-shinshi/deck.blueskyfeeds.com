import Link from "next/link";
import {AiOutlineEdit, AiOutlineHeart} from "react-icons/ai";
import ButtonSocialShare from "@/lib/components/ButtonSocialShare";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === "1";
export default function UserActions ({href, sceneId}) {
    return <div className="flex space-x-2">
        {
            DEBUG_MODE && <Link href={`/admin/scene/edit/${sceneId}`}>
                <AiOutlineEdit className="h-8 w-8 hover:text-red-600 bg-orange-400 rounded-full p-1"/>
            </Link>
        }

        {
            DEBUG_MODE && <AiOutlineHeart className="h-8 w-8 hover:text-red-600 bg-orange-400 rounded-full p-1" />
        }
        <ButtonSocialShare url={`${BASE_URL}${href}`}/>
    </div>
}