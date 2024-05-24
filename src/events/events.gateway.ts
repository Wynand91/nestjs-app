import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from "socket.io"
import { ServerToClientEvents } from './types/events';
import { ArticleEntity } from 'src/articles/entities/article.entity';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/ws-jwt/ws-jwt.guard';
import { SocketAuthMiddleware } from 'src/auth/ws.mw';
import { kafkaProducer, kafkaConsumer } from '../kafka.config';
// import { Message } from 'src/events/generated/src/proto/messages/message_pb'

async function sendEvent(topic: string, message: any) {
  // function connects to kafka server and sends messages
  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic: topic,
    messages: [{ value: message }]
  });
  Logger.log('Kafka event sent');
  await kafkaProducer.disconnect();
}

async function initializeKafkaConsumer(gateway: EventsGateway) {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({ topic: 'test-topic' });
  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value}`)
      const respMessage = 'This notification was fired by kafka consumer!'
      gateway.sendNotification(respMessage)
    }
  })
}


@WebSocketGateway({namespace: 'events', cors: {origin: '*', methods: ['GET', 'POST']}})
@UseGuards(WsJwtGuard)
export class EventsGateway {
  
  // any -> types for client to server messages
  // ServerToClientEvents -> type expected for server to client messages
  @WebSocketServer()
  server: Server<any, any>;
  // server: Server<any, ServerToClientEvents>;

  afterInit(client: Socket) {
    // use middleware to authenticate
    client.use(SocketAuthMiddleware() as any)
    initializeKafkaConsumer(this)
  }

  @SubscribeMessage('test')
  testPing(client: any, payload: any) {
    this.server.emit('test', 'Test successful')
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    // test protobuf (de)serialization
    // const message = new Message()
    // message.setTitle(payload.title)
    // message.setDescription(payload.description)
    // message.setBody(payload.body)

    // const serializedMessage = message.serializeBinary()
    // const deserializedMessage = Message.deserializeBinary(serializedMessage)
    // Logger.log(serializedMessage)
    // Logger.log(deserializedMessage)

    // add logic to send event to kafka queue
    await sendEvent('test-topic', payload)
  }

  sendNotification(message: string) {
    console.log('sending notification')
    this.server.emit('notification', message)
  }

  // send message for new articles
  sendNewArticleMessage(message: ArticleEntity) {
    this.server.emit('newArticle', message)
  }
}

//

