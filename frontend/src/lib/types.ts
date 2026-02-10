export interface GalleryData {
    id?: string;
    yourName: string;
    partnerName: string;
    loveMessage: string;
    specialDate: string;
    yourWhatsapp?: string;
    partnerWhatsapp?: string;
    photos: { id: string; url: string; caption?: string }[];
    theme: "rose-red" | "soft-pink" | "candle-light" | "midnight-passion" | "ocean-romance" | "golden-sunset" | "enchanted-forest" | "lavender-dream" | "lavender-mist" | "velvet-night" | "classic-love" | "cherry-blossom" | "starry-sky" | "autumn-warmth" | "mystic-aura" | "pure-elegance";
    music: string;
    stories: { title: string; content: string; icon: string }[];
    slug: string;
}

export const generateSlug = (name1: string, name2: string) => {
    return `${name1.toLowerCase()}-${name2.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}`.replace(/\s+/g, '-');
};
