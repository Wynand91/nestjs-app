import { Injectable, Logger } from "@nestjs/common";
import * as Redis from "ioredis"


@Injectable()
export class WebSocketService {
    private redisClient: Redis.Redis

    constructor() {
        this.redisClient = new Redis.Redis({
            host: 'redis',
            port: 6379
        })
    }

    async addConnection(username: string, socketId: string) {
        await this.redisClient.sadd(username, socketId)
    }

    async removeConnection(username: string, socketId: string) {
        await this.redisClient.srem(username, socketId);
    }

    async getUserConnections(username: string): Promise<any> {
        const socketIds = await this.redisClient.smembers(`${username}`);
        Logger.log(socketIds[0])
        return socketIds[0];
    }

}