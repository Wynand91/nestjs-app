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
        Logger.log(`${username} connection added to redis: , ${socketId}`)
        await this.redisClient.set(username, socketId)
    }

    async removeConnection(username: string, socketId: string) {
        Logger.log(`removeConnection: ${username}, ${socketId}`)
        await this.redisClient.del(username);
    }

    async getUserConnections(username: string): Promise<any> {
        const socketId = await this.redisClient.get(`${username}`);
        return socketId;
    }

}