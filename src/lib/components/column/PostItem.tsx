import {
    Post,
    PostEmbedExternal,
    PostEmbedImages,
    PostEmbedRecord,
    PostEmbedRecordWithMedia,
    PostFacetLink,
    PostFacetMention,
    PostFacetTag,
    RecordFeed,
    RecordList,
    RecordPost,
} from "@/lib/utils/types-constants/post";
import {useSelector} from "react-redux";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import clsx from "clsx";
import ReactTimeAgo from 'react-time-ago'
import {BiRepost} from "react-icons/bi";
import {FaReply} from "react-icons/fa";
import {getPostThread} from "@/lib/utils/bsky/bsky-feed";
import {HiOutlineChatBubbleOvalLeft} from "react-icons/hi2";
import {AiOutlineHeart} from "react-icons/ai";
import {FaEllipsis} from "react-icons/fa6";
import AvatarFeed from "@/lib/components/ui/AvatarFeed";
import Image from "next/image";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";
import {BsListNested} from "react-icons/bs";
import {PopupConfigPostAction, PopupState} from "@/lib/utils/types-constants/popup";
import {useLongPress} from "use-long-press";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {setPopupConfig} from "@/lib/utils/redux/slices/local";
import {store, StoreState} from "@/lib/utils/redux/store";

export default function PostItem({post, columnId, highlight=false}: {post:Post, columnId:string, highlight:boolean}) {
    const offsetLeft = useSelector((state:StoreState) => state.config.offsetLeft);
    const longPressPost = useLongPress(()=> {}, {
        cancelOnMovement:25,
        cancelOutsideElement:true,
        onFinish:(evt, target) => {
            if (!highlight) {
                openThread(post.uri);
            }
        },
    });
    const openThread = async (uri) => {
        console.log("opening ", uri);
        const state = store.getState();
        await getPostThread(state.storage.columnDict[columnId].observers[0], columnId, uri);
    }

    const PostHeader = ({id, indexedAt, mini=false}) => {
        const userAvatar = useSelector((state:StoreState) => state.memory.userData[id].avatar);
        const userHandle = useSelector((state:StoreState) => state.memory.userData[id].handle);
        const userName = useSelector((state:StoreState) => state.memory.userData[id].displayName);

        return <div className="flex justify-between">
            <div className="flex gap-2 grow-0 overflow-hidden place-items-center group">
                <div className={clsx(mini? "w-6 h-6": "w-8 h-8", "relative aspect-square rounded-full border border-theme_dark-I0")}>
                    <AvatarUser avatar={userAvatar} alt="User Avatar"/>
                </div>

                <div className="overflow-hidden">
                    { userName && <div className={clsx(mini? "text-xs": "text-sm", "text-theme_dark-T0 truncate")}>{userName}</div>}
                    <div className="text-theme_dark-T1 text-xs group-hover:underline">{userHandle}</div>
                </div>
            </div>

            <div className="text-theme_dark-T0">
                <ReactTimeAgo date={indexedAt} locale="en-US" timeStyle="twitter"/>
            </div>
        </div>
    }

    const PostImages = ({embedImage}: {embedImage:PostEmbedImages}) => {
        const {thumbnailSize, thumbnailNumber} = useSelector((state:StoreState) => {
            const column = state.storage.columns[columnId];
            if (column) {
                let thumbnailNumber = 0;
                switch (column.thumbnailSize) {
                    case ThumbnailSize.X_SMALL: thumbnailNumber = 50; break;
                    case ThumbnailSize.SMALL: thumbnailNumber = 200; break;
                    case ThumbnailSize.MEDIUM: thumbnailNumber = 300; break;
                    case ThumbnailSize.LARGE: thumbnailNumber = 400; break;
                }
                return {thumbnailSize, thumbnailNumber};
            }
            return {thumbnailSize:ThumbnailSize.HIDDEN, thumbnailNumber:0};
        });
        return <>
            {
                thumbnailSize === ThumbnailSize.HIDDEN && <div className="grid place-items-center">
                    <button type="button" className="p-2 bg-theme_dark-I2 rounded-md">Image</button>
                </div>
            }
            {
                thumbnailSize !== ThumbnailSize.HIDDEN && <div className="p-1">
                    {
                        embedImage.images.length === 1 &&
                        <div className="grid place-items-center">
                            <Image height={thumbnailNumber} width={thumbnailNumber} src={embedImage.images[0].thumb} alt={embedImage.images[0].alt}/>
                        </div>
                    }
                    {
                        embedImage.images.length === 2 || embedImage.images.length === 4 &&
                        <div className="grid place-items-center">
                            <div className={clsx("grid grid-cols-2", thumbnailSize===ThumbnailSize.SMALL && "w-44", thumbnailSize===ThumbnailSize.MEDIUM && "w-64")}>
                                {
                                    embedImage.images.map((img,i) => {
                                        return <Image
                                            key={i}
                                            height={thumbnailNumber}
                                            width={thumbnailNumber}
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
                        </div>
                    }

                    {
                        embedImage.images.length === 3 &&
                        <div className="grid place-items-center">
                            <div className={clsx("grid grid-cols-3 grid-flow-col", thumbnailSize===ThumbnailSize.SMALL && "w-44", thumbnailSize===ThumbnailSize.MEDIUM && "w-64")}>
                                {
                                    embedImage.images.map((img,i) => {
                                        return <Image
                                            key={i}
                                            height={thumbnailNumber}
                                            width={thumbnailNumber}
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
                        </div>
                    }
                </div>
            }
        </>
    }
    const PostQuote = ({record}:{record:RecordPost}) => {
        return  <div className="p-2 border border-gray-500 hover:border-white rounded-md" onClick={() => {openThread(record.uri)} }>
            <PostHeader id={record.authorDid} indexedAt={record.indexedAt} mini={true}/>
            <div className="text-theme_dark-T0">{record.text}</div>

            {record.embed && <PostEmbeds postItem={record}/>}
        </div>
    }
    const PostFeed = ({record}:{record:RecordFeed}) => {
        return  <div className="bg-theme_dark-L2 p-2">
            <div className="w-8 h-8 relative">
                <AvatarFeed avatar={record.avatar}/>
            </div>
            <div>{record.displayName}</div>
            <div>{record.description}</div>
        </div>
    }

    const PostList = ({record}:{record:RecordList}) => {
        return  <div className="bg-theme_dark-L2 p-2">
            <div className="w-8 h-8 relative">
                <AvatarUser avatar={record.avatar} alt={record.name}/>
            </div>
            <div>{record.name}</div>
            <div>{record.purpose}</div>
        </div>
    }


    const PostRecord = ({embedRecord}: {embedRecord: PostEmbedRecord | PostEmbedRecordWithMedia}) => {
        return <>
            {
                embedRecord.record.type === "Post" && <PostQuote record={embedRecord.record as RecordPost}/>
            }
            {
                embedRecord.record.type === "Feed" && <PostFeed record={embedRecord.record as RecordFeed}/>
            }
            {
                embedRecord.record.type === "List" && <PostList record={embedRecord.record as RecordList}/>
            }
            {
                embedRecord.record.type === "Blocked" && <div>Post Blocked</div>
            }
            {
                embedRecord.record.type === "Deleted" && <div>Post Deleted</div>
            }
        </>
    }

    const PostExternal = ({embedExternal}: {embedExternal: PostEmbedExternal}) => {
        return <div>External</div>
    }

    const PostEmbeds = ({postItem}) => {
        return <>
            {
                postItem.embed.type === "Images" &&
                <PostImages embedImage={postItem.embed as PostEmbedImages}/>
            }
            {
                'media' in postItem.embed && (postItem.embed as PostEmbedRecordWithMedia).media.type === "Images" &&
                <PostImages embedImage={(postItem.embed as PostEmbedRecordWithMedia).media as PostEmbedImages}/>
            }
            {
                postItem.embed.type === "External" &&
                <PostExternal embedExternal={postItem.embed as PostEmbedExternal}/>
            }
            {
                'media' in postItem.embed && (postItem.embed as PostEmbedRecordWithMedia).media.type === "External" &&
                <PostExternal embedExternal={(postItem.embed as PostEmbedRecordWithMedia).media as PostEmbedExternal}/>
            }
            {
                postItem.embed.type === "Record" &&
                <PostRecord embedRecord={postItem.embed as PostEmbedRecord}/>
            }
            {
                postItem.embed.type === "RecordWithMedia" &&
                <PostRecord embedRecord={postItem.embed as PostEmbedRecordWithMedia}/>
            }
        </>
    }

    const RepostedBy = () => {
        const reposterName = useSelector((state:StoreState) => getUserName(state.memory.userData[post.reposterDid]));
        return <div className="text-theme_dark-T0 flex place-items-center pl-6 mb-1 hover:underline"
                    onClick={(evt) => {
                        evt.stopPropagation();
                        console.log("open reposter", post.reposterDid);
                    }}>
            <BiRepost className="h-4 w-4 text-green-500" />
            <div className="whitespace-nowrap text-ellipsis overflow-hidden">Reposted by {reposterName}</div>
        </div>
    }

    const ReplyTo = () => {
        const replyToName = useSelector((state:StoreState) => getUserName(state.memory.userData[post.replyTo]));
        return <div className="text-theme_dark-T1 flex place-items-center gap-1 p-1">
            <FaReply className="h-3 w-3 peer"
                     onClick={() => openThread(post.parentUri)}/>
            <div className="hover:underline peer-hover:underline shrink-0"
                 onClick={() => openThread(post.parentUri)}>Reply to</div>
            <div className="whitespace-nowrap text-ellipsis overflow-hidden hover:underline"
                 onClick={() => {
                     console.log("open profile", post.replyTo);

                 }}
            >
                {` ${replyToName}`}
            </div>
        </div>
    }

    return <div {...longPressPost()} className={clsx("w-full rounded-md flex flex-col p-2 whitespace-pre-line text-xs border border-transparent hover:border-white", highlight? "bg-slate-700" : "bg-theme_dark-L1")}>
        {post.reposterDid && <RepostedBy />}

        <PostHeader id={post.authorDid} indexedAt={post.indexedAt}/>

        <div className={clsx(offsetLeft && "pl-10", "text-theme_dark-T0 overflow-hidden")}>
            {post.replyTo && <ReplyTo />}
            <div className="p-1">
                {
                    post.textParts && post.textParts.map((textPart, i) => <span key={i}>
                        {
                            textPart.facet?.type === "Link" &&
                            <a href={(textPart.facet as PostFacetLink).uri} className="group"
                               onClick={(evt) => evt.stopPropagation()}
                               target="_blank" rel="noreferrer">
                                <span className="text-blue-500 group-hover:underline">{textPart.text}</span>
                                <span className="text-gray-500">({(textPart.facet as PostFacetLink).uri.split("/")[2]})</span>
                            </a>
                        }
                        {
                            textPart.facet?.type === "Mention" &&
                            <span
                                  className="text-blue-500 hover:underline"
                                  onClick={(evt) => {
                                      evt.stopPropagation();
                                      console.log((textPart.facet as PostFacetMention).did);
                                  }}>
                                {textPart.text}
                            </span>
                        }
                        {
                            textPart.facet?.type === "Tag" &&
                            <span
                                  className="text-blue-500 hover:underline"
                                  onClick={(evt) => {
                                      evt.stopPropagation();
                                      console.log((textPart.facet as PostFacetTag).tag);
                                  }}>
                                {textPart.text}
                            </span>
                        }
                        {
                            !textPart.facet &&
                            <span >{textPart.text}</span>
                        }
                    </span>)
                }
                {!post.textParts && post.text}
                {
                    post.tags.length > 0 && <div className="flex gap-2">
                        Append:
                        {
                            post.tags.map(tag =>
                                <div key={tag}
                                     className="text-blue-500 hover:underline"
                                     onClick={(evt) => {
                                         evt.stopPropagation();
                                         console.log(tag);
                                     }}>
                                    #{tag}
                                </div>)
                        }
                    </div>
                }
            </div>

            {post.embed && <PostEmbeds postItem={post}/>}


            <div>
                <div className="w-full h-px bg-gray-400 mt-1" />
                {
                    highlight && (post.replyCount > 0 || post.repostCount > 0 || post.likeCount > 0) && <>
                        <div className="flex gap-4 p-2">
                            {post.replyCount > 0 && <div>{post.replyCount} {post.replyCount === 1? "Reply" : "Replies"}</div>}
                            {post.repostCount > 0 && <div>{post.repostCount} {post.repostCount === 1? "Repost" : "Reposts" }</div>}
                            {post.likeCount > 0 && <div>{post.likeCount} {post.likeCount === 1? "Like" : "Likes"}</div>}
                        </div>
                    </>
                }

                <div className="flex gap-4">
                    {
                        !highlight && <button
                            type="button"
                            className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                            onClick={(evt) => {
                                evt.stopPropagation();
                                openThread(post.uri);
                            }}>
                            <BsListNested className="w-4 h-4"/>
                        </button>
                    }

                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("reply");
                        }}>
                        <HiOutlineChatBubbleOvalLeft className="w-4 h-4"/>
                        {!highlight && post.replyCount > 0 && post.replyCount}
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("repost");
                        }}>
                        <BiRepost className="h-4 w-4" />
                        {!highlight && post.repostCount > 0 && post.repostCount}
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center justify-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("like");
                        }}>
                        <AiOutlineHeart className="h-4 w-4" />
                        {!highlight && post.likeCount > 0 && post.likeCount}
                    </button>
                    <button
                        type="button"
                        className="flex place-items-center gap-1 hover:bg-gray-400 min-w-6 min-h-6 p-1"
                        onClick={(evt) => {
                            evt.stopPropagation();
                            console.log("etc");
                            setPopupConfig({
                                state: PopupState.POST_ACTION,
                                uri: post.uri
                            } as PopupConfigPostAction);
                        }}
                    >
                        <FaEllipsis className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
}