"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

// ─── Emoji data — all iOS emoji groups ────────────────────────────────────────
export const EMOJI_GROUPS: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: "Finance",
    icon: "💰",
    emojis: [
      "💰","💵","💴","💶","💷","💸","💳","🪙","💹","📈","📉","📊","🏦","🏧","💎",
      "🤑","💼","🧾","📋","📌","🔑","🪝","⚖️","🏷️","🎫","🎟️","💡","📦","🔄","❓",
    ],
  },
  {
    label: "Food & Drink",
    icon: "🍔",
    emojis: [
      "🍔","🍕","🍜","🍱","🍣","🍤","🍙","🍚","🍛","🍝","🍲","🥗","🥘","🫕","🥫",
      "🧆","🥙","🌮","🌯","🫔","🥪","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩",
      "🍗","🍖","🌭","🍟","🍿","🧂","🥐","🍞","🥖","🧁","🎂","🍰","🍫","🍬","🍭",
      "🍮","🍯","🍦","🍧","🍨","🍩","🍪","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻",
      "🥂","🍷","🥃","🍸","🍹","🍾","🫖","🧊","🥛","🍼","🫗",
    ],
  },
  {
    label: "Travel",
    icon: "✈️",
    emojis: [
      "✈️","🚗","🚕","🚌","🚎","🚐","🚑","🚒","🚓","🚙","🛻","🚚","🚛","🚜","🏎️",
      "🏍️","🛵","🛺","🚲","🛴","🛹","🛼","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟",
      "⛵","🚤","🛥️","🛳️","⛴️","🚢","🛩️","🚁","🛸","🪂","🚀","🏠","🏡","🏢","🏣",
      "🏤","🏥","🏦","🏨","🏪","🏫","🏬","🏭","🏯","🏰","🗼","🗽","🗺️","🌍","🌏",
      "🌐","🗻","🏔️","⛰️","🌋","🏕️","🏖️",
    ],
  },
  {
    label: "Shopping",
    icon: "🛍️",
    emojis: [
      "🛍️","👜","👛","👝","🎒","🧳","👒","🎩","🧢","👑","💍","💄","💅","👗","👘",
      "🥻","🩱","🩲","🩳","👙","👚","👛","👕","👔","🧥","🥼","👖","🧣","🧤","🧦",
      "👞","👟","🥾","🥿","👠","👡","🩴","👢","💼","🛒","🎁","🎀","🎊","🎉","🎈",
    ],
  },
  {
    label: "Health",
    icon: "💊",
    emojis: [
      "💊","🩺","🏥","🩹","🩻","💉","🩸","🩼","🦷","🦴","👁️","👂","👃","🫁","🫀",
      "🧠","🦾","🦿","🦵","🦶","💪","🏋️","🧘","🏊","🚴","🤸","⛹️","🏇","🤾","🏄",
      "🧗","🤺","🥊","🥋","🎯","🧬","🔬","🔭",
    ],
  },
  {
    label: "Education",
    icon: "📚",
    emojis: [
      "📚","📖","📝","✏️","🖊️","🖋️","📓","📔","📒","📕","📗","📘","📙","📃","📄",
      "📑","🗒️","📊","📈","📉","🗂️","🗃️","🗄️","📁","📂","📌","📍","✂️","🖇️","📎",
      "🖊️","🖌️","🎨","🖼️","🖥️","💻","⌨️","🖱️","📱","☎️","📞","📟","📠","🔎","🔍",
      "🔬","🔭","🎓","🏫","📐","📏","🧮","📡","🎒",
    ],
  },
  {
    label: "Entertainment",
    icon: "🎮",
    emojis: [
      "🎮","🕹️","🎲","♟️","🎯","🎱","🎳","🏓","🏸","⛳","🎣","🏹","🎿","🛷","🥌",
      "🎼","🎵","🎶","🎙️","🎚️","🎛️","📻","🎷","🎸","🎹","🎺","🎻","🪕","🥁","🪘",
      "🎭","🎬","🎥","📷","📸","📹","🎞️","📺","🎪","🎠","🎡","🎢","🎫","🎟️","🤹",
      "🪄","🔮","🎉","🎊","🎈","✨","🎆","🎇","🧨",
    ],
  },
  {
    label: "Nature",
    icon: "🌿",
    emojis: [
      "🌿","🌱","🌲","🌳","🌴","🌵","🎋","🎍","🍀","🌺","🌸","🌼","🌻","🌹","🥀",
      "🌷","🌾","🍁","🍂","🍃","🌊","🌈","☀️","🌤️","⛅","🌧️","⛈️","🌩️","🌨️","❄️",
      "☃️","⛄","🌬️","💨","🌪️","🔥","💧","🦋","🐝","🐞","🐢","🐍","🦎","🐊","🐸",
      "🐇","🐈","🐕","🐩","🦮","🐓","🦃","🦚","🦜","🦢",
    ],
  },
  {
    label: "Objects",
    icon: "🔧",
    emojis: [
      "🔧","🪛","🔨","⚒️","🛠️","⛏️","⚙️","🗜️","🪤","🔩","🪝","🧲","🔋","💡","🔦",
      "🕯️","🪔","🧯","🛢️","🪣","🧴","🧹","🧺","🧻","🧼","🪥","🪒","🧽","🧰","🪤",
      "🧲","💊","💉","🩺","🩹","🧪","🧫","🧬","🔬","🔭","📡","🚿","🛁","🚪","🪞",
      "🪟","🛏️","🛋️","🪑","🧸","🪆","🖼️","🧧","🎀","🎁","🪄","🧿","🪬","🎭","🎨",
    ],
  },
  {
    label: "Symbols",
    icon: "⭐",
    emojis: [
      "⭐","🌟","✨","💫","⚡","🔥","🌊","🎯","🏆","🥇","🥈","🥉","🎖️","🏅","🎗️",
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","❤️‍🔥","❤️‍🩹","💔","💕","💞","💓",
      "💗","💖","💝","💘","💟","☮️","✝️","☪️","🕉️","✡️","🔯","☯️","🔰","♻️","✅",
      "❎","🆗","🆙","🆒","🆕","🆓","💯","0️⃣","#️⃣",
    ],
  },
  {
    label: "People",
    icon: "👤",
    emojis: [
      "👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅",
      "🙆","💁","🙋","🧏","🙇","🤦","🤷","💆","💇","🚶","🧍","🧎","🏃","💃","🕺",
      "👯","🧖","🧗","🏋️","🤸","⛹️","🤺","🏊","🚴","🤽","🧘","🏄","👀","👅","👄",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose?: () => void;
}

export default function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  const [activeGroup, setActiveGroup] = useState(0);

  const displayEmojis = [...new Set(EMOJI_GROUPS[activeGroup]?.emojis ?? [])];

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-primary)] w-72 flex flex-col animate-fade-in">
      {/* Header — group label + close button */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[var(--color-border)]">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
          {EMOJI_GROUPS[activeGroup]?.label}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Group tabs */}
      <div className="flex overflow-x-auto border-b-2 border-[var(--color-border)]">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setActiveGroup(i)}
            title={g.label}
            className={`flex-shrink-0 px-3 py-2 text-base transition-colors ${
              activeGroup === i
                ? "bg-[var(--color-primary)]/15 border-b-2 border-[var(--color-primary)]"
                : "hover:bg-[var(--color-surface-2)]"
            }`}
          >
            {g.icon}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="overflow-y-auto max-h-48 p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {displayEmojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              type="button"
              onClick={() => { onChange(emoji); onClose?.(); }}
              className={`w-8 h-8 flex items-center justify-center text-lg rounded transition-all hover:bg-[var(--color-surface-2)] hover:scale-110 ${
                value === emoji
                  ? "bg-[var(--color-primary)]/20 ring-2 ring-[var(--color-primary)] ring-inset"
                  : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
