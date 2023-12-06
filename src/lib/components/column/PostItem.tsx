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
    TextPart
} from "@/lib/utils/types-constants/post";
import {ColumnConfig, ObservedColumn} from "@/lib/utils/types-constants/column";
import {useDispatch, useSelector} from "react-redux";
import AvatarUser from "@/lib/components/AvatarUser";
import clsx from "clsx";
import ReactTimeAgo from 'react-time-ago'
import {BiRepost} from "react-icons/bi";
import {FaReply} from "react-icons/fa";
import {getPostThread} from "@/lib/utils/bsky/bsky-feed";
import {HiOutlineChatBubbleOvalLeft} from "react-icons/hi2";
import {AiOutlineHeart} from "react-icons/ai";
import {FaEllipsis} from "react-icons/fa6";
import AvatarFeed from "@/lib/components/AvatarFeed";
import Image from "next/image";
import {ThumbnailSize} from "@/lib/utils/types-constants/thumbnail-size";

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
        const id = 'observer' in column? (column as ObservedColumn).observer : config.primaryBlueskyDid;
        if (!id) {
            alert("no account available to open thread");
        } else {
            await getPostThread(id, column.id, post.uri);
        }
    }

    const thumbSizeToNumber = () => {
        switch (column.thumbnailSize) {
            case ThumbnailSize.SMALL: return 50;
            case ThumbnailSize.MEDIUM: return 100;
            case ThumbnailSize.LARGE: return 200;
        }
    }

    const PostHeader = ({id, indexedAt}) => {
        const user = memory.userData[id];
        return <div className="flex justify-between">
            <div className="flex gap-1 grow-0 overflow-hidden ">
                <div className="w-10 h-10 relative aspect-square">
                    <AvatarUser avatar={user.avatar}/>
                </div>

                <div className="overflow-hidden ">
                    <div className="text-theme_dark-T0 text-sm truncate">{user.displayName || user.handle}</div>
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
                        <a href={(textPart.facet as PostFacetLink).uri} className="group"
                           onClick={(evt) => {
                               const url = (textPart.facet as PostFacetLink).uri;
                               console.log(url);
                           }}
                        >
                            <span className="text-blue-500 group-hover:underline">{textPart.text}</span>
                            <span className="text-gray-500">({(textPart.facet as PostFacetLink).uri.split("/")[2]})</span>
                        </a>
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
                column.thumbnailSize === ThumbnailSize.HIDDEN && <div className="grid place-items-center">
                    <button type="button" className="p-2 bg-theme_dark-I2 rounded-md">Image</button>
                </div>
            }
            {
                column.thumbnailSize !== ThumbnailSize.HIDDEN && <div className="p-4">
                    {
                        embedImage.images.length === 1 &&
                        <Image height={thumbSizeToNumber()} width={thumbSizeToNumber()} src={embedImage.images[0].thumb} alt={embedImage.images[0].alt}/>

                    }
                    {
                        embedImage.images.length === 2 || embedImage.images.length === 4 &&
                        <div className={clsx("grid grid-cols-2", column.thumbnailSize===ThumbnailSize.SMALL && "w-44", column.thumbnailSize===ThumbnailSize.MEDIUM && "w-64")}>
                            {
                                embedImage.images.map((img,i) => {
                                    return <Image key={i}
                                                  height={thumbSizeToNumber()}
                                                  width={thumbSizeToNumber()}
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
                        <div className={clsx("grid grid-cols-3 grid-flow-col", column.thumbnailSize===ThumbnailSize.SMALL && "w-44", column.thumbnailSize===ThumbnailSize.MEDIUM && "w-64")}>
                            {
                                embedImage.images.map((img,i) => {
                                    return <Image key={i}
                                                  height={thumbSizeToNumber()}
                                                  width={thumbSizeToNumber()}
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
                </div>
            }



        </>
    }
    const PostQuote = ({record}:{record:RecordPost}) => {
        return  <div className="bg-theme_dark-L2 p-2">
            <PostHeader id={record.authorDid} indexedAt={record.indexedAt}/>
            <div className="text-theme_dark-T0">{record.text}</div>
            {
                record.embed && record.embed.type === "RecordWithMedia" && (record.embed as PostEmbedRecordWithMedia).media.type === "Images" &&
                <PostImages embedImage={(record.embed as PostEmbedRecordWithMedia).media as PostEmbedImages}/>
            }

            <PostEmbeds postItem={record}/>
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
                <AvatarUser avatar={record.avatar}/>
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
        return <div/>
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
                        <PostRecord embedRecord={postItem.embed as PostEmbedRecord}/>
                    }
                    {
                        postItem.embed && postItem.embed.type === "RecordWithMedia" &&
                        <PostRecord embedRecord={postItem.embed as PostEmbedRecordWithMedia}/>
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

        <PostHeader id={post.authorDid} indexedAt={post.indexedAt}/>

        <div className={clsx(config.offsetLeft && "pl-10", "text-theme_dark-T0 overflow-hidden")}>
            {post.replyTo && <div className="text-theme_dark-T1 flex place-items-center hover:underline">
                <FaReply className="h-3 w-3 mr-1"/>
                <div className="whitespace-nowrap text-ellipsis overflow-hidden">Reply to {memory.userData[post.replyTo].displayName}</div>
            </div>}
            <div>
                {
                    post.textParts && post.textParts.map((textPart, i) => <>
                        {
                            textPart.facet?.type === "Link" &&
                            <a key={i} href={(textPart.facet as PostFacetLink).uri} className="group"
                               target="_blank" rel="noreferrer">
                                <span className="text-blue-500 group-hover:underline">{textPart.text}</span>
                                <span className="text-gray-500">({(textPart.facet as PostFacetLink).uri.split("/")[2]})</span>
                            </a>
                        }
                        {
                            textPart.facet?.type === "Mention" &&
                            <span key={i}
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
                            <span key={i}
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
                            <span key={i}>{textPart.text}</span>
                        }
                    </>)
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