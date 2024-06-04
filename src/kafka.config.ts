import { Kafka, logLevel } from "kafkajs";
import {v4 as uuidv4} from 'uuid';

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka:9092'],
    logLevel: logLevel.ERROR,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({groupId: `${uuidv4()}`});
kafkaConsumer.connect();
kafkaConsumer.subscribe({ topic: 'test-topic' });