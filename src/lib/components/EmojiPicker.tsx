// https://github.com/nolanlawson/emoji-picker-element
// https://docs.joinmastodon.org/methods/custom_emojis/

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function EmojiPicker ({}) {
    return <Picker data={data} onEmojiSelect={console.log} />
}