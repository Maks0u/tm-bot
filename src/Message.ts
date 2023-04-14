export default class Message {
    private content: string;
    private embeds: Embed[] = [];

    constructor(content: string = '') {
        this.content = content;
    }

    setContent(text: string): Message {
        this.content = text;
        return this;
    }
    setEmbeds(embeds: Embed[]): Message {
        this.embeds = embeds.map(embed => Object.assign({ color: 0x2b2d31 }, embed));
        return this;
    }
    addEmbed(embed: Embed): Message {
        this.embeds.push({ color: 0x2b2d31, ...embed });
        return this;
    }
}

export interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: { text: string; icon_url?: string; proxy_icon_url?: string };
    image?: { url: string; proxy_url?: string; height?: number; width?: number };
    thumbnail?: { url: string; proxy_url?: string; height?: number; width?: number };
    video?: { url: string; proxy_url?: string; height?: number; width?: number };
    provider?: { name?: string; url?: string };
    author?: { name: string; url?: string; icon_url?: string; proxy_icon_url?: string };
    fields?: { name: string; value: string; inline?: boolean }[];
}
