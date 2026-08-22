import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";





@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {


    constructor(
        private reflector: Reflector
        /*
        Reflector is used because custom constructors do not implement logic on their own they need
        reflectors to attach metadata to them that is why we are using reflectors here
        */     
    ){
        super()

    }
        canActivate(context: ExecutionContext) {
            return super.canActivate(context);
        }
}