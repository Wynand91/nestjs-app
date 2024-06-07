import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from "socket.io"
import { ServerToClientEvents } from './types/events';
import { ArticleEntity } from 'src/articles/entities/article.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/ws-jwt/ws-jwt.guard';
import { SocketAuthMiddleware } from 'src/auth/ws.mw';
import { kafkaProducer, kafkaConsumer } from '../kafka.config';
import { verify } from 'jsonwebtoken';
import { jwtSecret } from 'src/auth/auth.module';
import { WebSocketService } from './events.service';


@WebSocketGateway({namespace: 'events', cors: {origin: '*', methods: ['GET', 'POST']}})
@UseGuards(WsJwtGuard)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly webSocketService: WebSocketService){}
  
  // any -> types for client to server messages
  // ServerToClientEvents -> type expected for server to client messages
  @WebSocketServer()
  server: Server<any, any>;
  // server: Server<any, ServerToClientEvents>;

  afterInit(client: Socket) {
    // use middleware to authenticate
    client.use(SocketAuthMiddleware() as any)
    this.handleKafkaQueue()
  }

  async handleKafkaQueue() {
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // message format should be: '{"email": "<email>", "message": "<message:str>"}'
        Logger.log(`Consumend mssg being handled: ${message.value}`)
        const mssgStr = message.value.toString()
        const body = JSON.parse(mssgStr)
        const recipient = body.email
        const mssg = body.message
        this.sendNotification(recipient, mssg)
      }
    })
  }

  async handleConnection(client: Socket, ...args: any[]) {
    // add user connection to redis
    const { authorization } = client.handshake.headers;
    const token: string = authorization.split(' ')[1];
    const payload: any = verify(token, jwtSecret)
    const username = payload.username;
    await this.webSocketService.addConnection(username, client.id )
  }

  async handleDisconnect(client: Socket) {
    // remove user connection from redis
    const { authorization } = client.handshake.headers;
    const token: string = authorization.split(' ')[1];
    const payload: any = verify(token, jwtSecret)
    const username = payload.username;
    const connection = await this.webSocketService.getUserConnections(username)
    await this.webSocketService.removeConnection(username, connection);
    Logger.log(`User: ${username} - disconnected `);
  }

  async sendEvent(topic: string, message: any) {
    // function connects to kafka server and sends messages
    await kafkaProducer.connect();
    await kafkaProducer.send({
      topic: topic,
      messages: [{ value: message }]
    });
    await kafkaProducer.disconnect();
  }

  @SubscribeMessage('test')
  async testPing(client: any, payload: any) {
    this.server.emit('test', 'Test successful')
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    // add logic to send event to kafka queue
    await this.sendEvent('test-topic', payload)
  }

  async sendNotification(recipient: string, message: string) {
    // check if the recipient has a current ws connection open, and send notifications if they do
    const connection = await this.webSocketService.getUserConnections(recipient)
    if (connection) {
      this.server.to(connection).emit('notification', message)
    }
  }

  // send message for new articles
  sendNewArticleMessage(message: ArticleEntity) {
    this.server.emit('newArticle', message)
  }
}

//

