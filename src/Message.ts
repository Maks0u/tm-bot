export default class Message {
    private tts?: boolean;
    private content?: string;
    private embeds?: Embed[];
    private allowed_mentions?: object;
    private flags?: number;
    private components?: Array<any>;
    private attachments?: Array<any>;

    constructor() {}

    setContent(text: string) {
        this.content = text;
        return this;
    }
    setEmbeds(embeds: Embed[]) {
        this.embeds = embeds;
        return this;
    }
    addEmbed(embed: Embed) {
        this.embeds?.push(embed);
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
