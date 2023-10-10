import {
    Post, PostEmbedExternal,
    PostEmbedImages, PostEmbedRecord, PostEmbedRecordWithMedia,
    PostFacetLink,
    PostFacetMention,
    PostFacetTag,
    TextPart
} from "@/lib/utils/types-constants/post";
import {ColumnConfig, ObservedColumn} from "@/lib/utils/types-constants/column";
import {useDispatch, useSelector} from "react-redux";
import AvatarUser from "@/lib/components/AvatarUser";
import clsx from "clsx";
import ReactTimeAgo from 'react-time-ago'
import {BiRepost} from "react-icons/bi";
import {FaReply} from "react-icons/fa";
import {getPostThread} from "@/lib/utils/bsky-feed";
import {HiOutlineChatBubbleOvalLeft} from "react-icons/hi2";
import {AiOutlineHeart} from "react-icons/ai";
import {FaEllipsis} from "react-icons/fa6";

export default function PostItem({post, column, highlight=false}: {post:Post, column:ColumnConfig, highlight:boolean}) {
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    const dispatch = useDispatch();

    const openThread = async () => {
        console.log("opening ", post.uri);
        // column observer OR primaryDid
        const did = 'observer' in column? (column as ObservedColumn).observer : config.primaryDid;
        if (!did) {
            alert("no account available to open thread");
        } else {
            await getPostThread(did, column.id, post.uri);
        }
    }


    const PostHeader = ({did, indexedAt}) => {
        const user = memory.userData[did];
        console.log(user);
        return <div className="flex justify-between">
            <div className="flex gap-1">
                <div className="w-10 h-10 relative aspect-square">
                    <AvatarUser uri={did} avatar={user.avatar}/>
                </div>

                <div>
                    <div className="text-theme_dark-T0 text-sm">{user.displayName || user.handle}</div>
                    <div className="hover:underline text-theme_dark-T1 text-xs">@{user.handle}</div>
                </div>
            </div>


            <div className="text-theme_dark-T0">
                <ReactTimeAgo date={indexedAt} locale="en-US" timeStyle="twitter"/>
            </div>
        </div>
    }
    const PostFacet = ({textPart}:{textPart:TextPart}) => {
        return <>
            {
                textPart.facet && <>
                    {
                        textPart.facet.type === "Link" &&
                        <span onClick={(evt) => {
                            evt.stopPropagation();
                            console.log((textPart.facet as PostFacetLink).uri);
                        }}>
                            <span className="text-blue-500 hover:underline">{textPart.text}</span>
                            <span className="text-gray-500">({(textPart.facet as PostFacetLink).uri.split("/")[2]})</span>
                        </span>
                    }
                    {
                        textPart.facet.type === "Mention" &&
                        <span className="text-blue-500 hover:underline"
                              onClick={(evt) => {
                                  evt.stopPropagation();
                                  console.log((textPart.facet as PostFacetMention).did);
                              }}>
                            {textPart.text}
                        </span>
                    }
                    {
                        textPart.facet.type === "Tag" &&
                        <span className="text-blue-500 hover:underline"
                              onClick={(evt) => {
                                  evt.stopPropagation();
                                  console.log((textPart.facet as PostFacetTag).tag);
                              }}>
                            {textPart.text}
                        </span>
                    }
                </>
            }

            {
                !textPart.facet &&
                <span>{textPart.text}</span>
            }
        </>
    }
    const PostImages = ({embedImage}: {embedImage:PostEmbedImages}) => {
        return <>
            {
                embedImage.images.length === 1 &&
                <img src={embedImage.images[0].thumb} alt={embedImage.images[0].alt}/>
            }
            {
                embedImage.images.length === 2 || embedImage.images.length === 4 &&
                <div className="grid grid-cols-2">
                    {
                        embedImage.images.map((img,i) => {
                            return <img key={i}
                                        className="aspect-square object-cover"
                                        src={img.thumb}
                                        alt={img.alt}
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            console.log("image!")
                                        }}
                            />
                        })
                    }
                </div>
            }

            {
                embedImage.images.length === 3 &&
                <div className="grid grid-cols-3 grid-flow-col">
                    {
                        embedImage.images.map((img,i) => {
                            return <img key={i}
                                        className={clsx(i === 0 && embedImage.images.length === 3 && "row-span-2 col-span-2", "aspect-square object-cover w-full h-full")}
                                        src={img.thumb}
                                        alt={img.alt}
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            console.log("image!")
                                        }}
                            />
                        })
                    }
                </div>
            }
        </>
    }
    const PostQuote = ({embedRecord}: {embedRecord: PostEmbedRecord | PostEmbedRecordWithMedia}) => {
        return <div className="bg-theme_dark-L2 p-2">
            <PostHeader did={embedRecord.record.authorDid} indexedAt={embedRecord.record.indexedAt}/>
            <div className="text-theme_dark-T0">{embedRecord.record.text}</div>
            {
                embedRecord.record.embed && embedRecord.record.embed.type === "RecordWithMedia" && (embedRecord.record.embed as PostEmbedRecordWithMedia).media.type === "Images" &&
                <PostImages embedImage={(embedRecord.record.embed as PostEmbedRecordWithMedia).media as PostEmbedImages}/>
            }

            <PostEmbeds postItem={embedRecord.record}/>
        </div>
    }

    const PostExternal = ({embedExternal}: {embedExternal: PostEmbedExternal}) => {

    }

    const PostEmbeds = ({postItem}) => {
        return <>
            {
                postItem && <>
                    {
                        postItem.embed && postItem.embed.type === "Images" &&
                        <PostImages embedImage={postItem.embed as PostEmbedImages}/>
                    }

                    {
                        postItem.embed && 'media' in postItem.embed && (postItem.embed as PostEmbedRecordWithMedia).media.type === "Images" &&
                        <PostImages embedImage={(postItem.embed as PostEmbedRecordWithMedia).media as PostEmbedImages}/>
                    }

                    {
                        postItem.embed && postItem.embed.type === "External" &&
                        <PostExternal embedExternal={postItem.embed as PostEmbedExternal}/>
                    }

                    {
                        postItem.embed && 'media' in postItem.embed && (postItem.embed as PostEmbedRecordWithMedia).media.type === "External" &&
                        <PostExternal embedExternal={(postItem.embed as PostEmbedRecordWithMedia).media as PostEmbedExternal}/>
                    }


                    {
                        postItem.embed && postItem.embed.type === "Record" &&
                        <PostQuote embedRecord={postItem.embed as PostEmbedRecord}/>
                    }
                    {
                        postItem.embed && postItem.embed.type === "RecordWithMedia" &&
                        <PostQuote embedRecord={postItem.embed as PostEmbedRecordWithMedia}/>
                    }
                </>
            }
        </>
    }

    return <div className={clsx("w-full rounded-md flex flex-col p-2 whitespace-pre-line text-xs hover:bg-gray-700", highlight? "bg-slate-700" : "bg-theme_dark-L1")}
                onClick={openThread}>
        {
            post.reposterDid &&
            <div className="text-theme_dark-T0 flex place-items-center pl-6 mb-1 hover:underline"
                 onClick={(evt) => {
                     evt.stopPropagation();
                     console.log("open reposter", post.reposterDid);
                 }}>
                <BiRepost className="h-4 w-4 text-green-500" />
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">Reposted by {memory.userData[post.reposterDid].displayName}</div>
            </div>
        }

        <PostHeader did={post.authorDid} indexedAt={post.indexedAt}/>

        <div className={clsx(config.offsetLeft && "pl-10", "text-theme_dark-T0 overflow-hidden")}>
            {post.replyTo && <div className="text-theme_dark-T1 flex place-items-center hover:underline">
                <FaReply className="h-3 w-3 mr-1"/>
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">Reply to {memory.userData[post.replyTo].displayName}</div>
            </div>}
            <div>
                {
                    post.textParts && post.textParts.map((x, i) => <PostFacet key={i} textPart={x}/>)
                }
                {
                    !post.textParts && post.text
                }
            </div>

            <PostEmbeds postItem={post}/>

            <div>
                <div className="w-full h-0.5 bg-gray-700" />
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("reply");
                        }}>
                        <HiOutlineChatBubbleOvalLeft className="w-4 h-4"/>
                        {
                            post.replyCount > 0 && post.replyCount
                        }
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("repost");
                        }}>
                        <BiRepost className="h-4 w-4" />
                        {
                            post.repostCount > 0 && post.repostCount
                        }
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("like");
                        }}>
                        <AiOutlineHeart className="h-4 w-4" />
                        {
                            post.likeCount > 0 && post.likeCount
                        }
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("etc");
                        }}
                    >
                        <FaEllipsis className="h-4 w-4" />
                    </button>
                </div>

            </div>

        </div>
    </div>
}