import Message from './Message.js';

export default class Command {
    private readonly config: CommandConfig;
    private readonly response: CommandResponse;

    constructor(config: Config) {
        this.config = config.config;
        this.response = config.response;
        this.compute = config.compute;
    }

    getName(): string {
        return this.getConfig().name;
    }
    getConfig(): CommandConfig {
        return this.config;
    }
    getResponse(): CommandResponse {
        return this.response;
    }
    async compute(data: IncomingCommandData, guildId: string): Promise<Message> {
        return new Message();
    }
}
export interface Config {
    config: CommandConfig;
    response: CommandResponse;
    compute: ComputeFunction;
}
export interface ComputeFunction {
    (data: IncomingCommandData, guildId: string): Promise<Message>;
}
export interface CommandResponse {
    type: number;
    data?: Message;
}
export interface CommandConfig {
    name: string;
    description: string;
    type: number;
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
}
export interface SubCommandConfig {
    name: string;
    description: string;
    type: number; // 1
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
    choices?: { name: string; value: string | number }[];
    required?: boolean;
}
export interface SubCommandGroupConfig {
    name: string;
    description: string;
    type: number; // 2
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
    choices?: { name: string; value: string | number }[];
    required?: boolean;
}
export interface IncomingCommandData {
    type: number;
    name: string;
    id: string;
    options?: any[];
}
