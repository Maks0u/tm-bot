import express, { NextFunction, Request, Response } from 'express';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { inspect } from 'util';
import { InteractionResponseType, InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import logger, { italic, white } from 'logger';
import Commands from './Commands.js';
import { CommandConfig } from './Command.js';

export default class App {
    private readonly server: express.Express = express();
    private readonly APP_ID: string = process.env.DISCORD_APP_ID || '';
    private readonly PUBLIC_KEY: string = process.env.DISCORD_APP_PUBLIC_KEY || '';
    private readonly AXIOS: AxiosInstance = axios.create({
        baseURL: process.env.DISCORD_BASEURL,
        headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': process.env.DISCORD_USER_AGENT,
        },
    });

    private commands?: Commands;

    constructor() {
        ['DISCORD_APP_ID', 'DISCORD_APP_PUBLIC_KEY', 'DISCORD_BOT_TOKEN', 'DISCORD_USER_AGENT', 'DISCORD_BASEURL'].forEach(v => {
            if (!process.env[v]) {
                throw new Error(`Please provide ${v}`);
            }
        });

        this.server.use(this.requestLogger.bind(this));
        this.server.use(verifyKeyMiddleware(this.PUBLIC_KEY));
        this.server.post('/interactions', this.interactions.bind(this));
    }

    start(port: number, host: string) {
        this.server.listen(port, host, () => {
            logger.info(`Discord app running on ${host}:${port}`);
        });
    }

    requestLogger(req: Request, res: Response, next: NextFunction) {
        logger.http(`${req.method} ${req.url}`);
        logger.debug(inspect(req.headers));
        logger.silly(inspect(req.body));
        next();
    }

    async interactions(req: Request, res: Response) {
        const { type, id, token, data, member, guild_id, channel_id } = req.body;

        if (InteractionType.PING === type) {
            res.send({ type: InteractionResponseType.PONG });
            return;
        }

        if (InteractionType.APPLICATION_COMMAND === type) {
            if (!this.commands) {
                res.status(StatusCodes.BAD_REQUEST).end();
                logger.warn(
                    `No command found, use ${italic('loadCommands')} and ${italic('installCommands')} functions to register commands`
                );
                return;
            }
            logger.info(`${white(data.name)} command from ${white(member.user.username)} (${member.user.id})`);

            const incomingCommand = this.commands.get(data.name);
            if (!incomingCommand) {
                logger.warn(`Command "${data.name}" not found`);
                res.status(StatusCodes.BAD_REQUEST).end();
                return;
            }
            const commandResponse = incomingCommand.getResponse();
            logger.debug(`Sending response ${inspect(commandResponse)}`);
            res.status(StatusCodes.OK).send(commandResponse).end();

            if (InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE === commandResponse.type) {
                const message = await incomingCommand.process(data);
                this.updateInteractionMessage(token, message);
            }
        }
    }

    request(endpoint: string, method: string = 'GET', data: object = {}): Promise<AxiosResponse> {
        logger.http(`Sending request - ${method} ${endpoint}`);
        return this.AXIOS.request({ method: method, url: endpoint, data: data });
    }

    loadCommands(): App {
        this.commands = new Commands();
        logger.debug(inspect(this.commands));
        return this;
    }

    private pushCommands(configs: CommandConfig[]): Promise<AxiosResponse> {
        return this.request(`applications/${this.APP_ID}/commands`, 'PUT', configs);
    }

    installCommands(): void | Promise<AxiosResponse> {
        if (!this.commands || !this.commands.size) {
            return;
        }
        logger.info('Installing commands...');
        return this.pushCommands(this.commands.getConfigs());
    }

    uninstallCommands(): Promise<AxiosResponse> {
        logger.info('Uninstalling commands...');
        return this.pushCommands([]);
    }

    sendMessage(channelId: string, data: object): Promise<AxiosResponse> {
        logger.info(`Sending message to ${channelId}`);
        return this.request(`channels/${channelId}/messages`, 'POST', data);
    }

    updateMessage(channelId: string, messageId: string, data: object): Promise<AxiosResponse> {
        logger.info(`Update message ${channelId} ${messageId}`);
        return this.request(`channels/${channelId}/messages/${messageId}`, 'PATCH', data);
    }

    deleteMessage(channelId: string, messageId: string): Promise<AxiosResponse> {
        logger.info(`Delete message ${channelId} ${messageId}`);
        return this.request(`channels/${channelId}/messages/${messageId}`, 'DELETE');
    }

    updateInteractionMessage(interactionToken: string, data: object): Promise<AxiosResponse> {
        logger.info(`Update interaction message`);
        return this.request(`webhooks/${this.APP_ID}/${interactionToken}/messages/@original`, 'PATCH', data);
    }

    deleteInteractionMessage(interactionToken: string): Promise<AxiosResponse> {
        logger.info('Delete interaction message');
        return this.request(`webhooks/${this.APP_ID}/${interactionToken}/messages/@original`, 'DELETE');
    }
}
