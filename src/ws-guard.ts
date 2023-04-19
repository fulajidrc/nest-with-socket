import { CanActivate, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
// import * as jwt from 'jsonwebtoken';

import * as jwt from 'jsonwebtoken';

import { JWT_KEY } from 'env';
import * as cookie from 'cookie';
@Injectable()
export class WsGuard implements CanActivate {
    constructor() {
    }
    canActivate(
        context: any,
    ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
        const cookieValue = context.args[0].handshake.headers.cookie;
        const cookieOptions = {}; // add any cookie options as needed
        const cookies = cookie.parse(cookieValue, cookieOptions);
        const bearerToken = cookies.myToken; 
        try {
            const decoded = jwt.verify(bearerToken, JWT_KEY);
            if(decoded){
                const message = context.switchToWs().getData();
                message.user = decoded;
                return true;
            }else{
                return false;
            }
        } catch (ex) {
            console.log(ex);

            context.args[0].emit('message', {
                type: 'LOGOUT',
            });
            return false;
        }
    }
}