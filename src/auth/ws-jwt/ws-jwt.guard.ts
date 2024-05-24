import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Socket } from "socket.io";
import { Observable } from 'rxjs';
import { verify, decode } from 'jsonwebtoken';
import { jwtSecret } from '../auth.module';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // if user is not trying to connect to ws gateway (http etc), allow it
    if (context.getType() != 'ws') {
      return true;
    }

    // if user is connecting to ws gateway, switch context to ws
    const client: Socket = context.switchToWs().getClient();
    const { authorization } = client.handshake.headers;

    WsJwtGuard.validateToken(client)

    return true;
  }

  static validateToken(client: Socket) {
    const {authorization} = client.handshake.headers
    // {authorization: 'Bearer <token>'}
    const token: string = authorization.split(' ')[1];
    try {
      const payload = verify(token, jwtSecret)
    } catch(error) {
      Logger.log('Error:');
      Logger.log(error);
    }
  }
}
