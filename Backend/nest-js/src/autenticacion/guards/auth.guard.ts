import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService) {}

    canActivate(
        contexto: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        const token = this.extractTokenFromCookie(contexto) || this.extractToken(contexto);

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = this.jwtService.verify(token);
            debugger;
            contexto.switchToHttp().getRequest().user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    extractToken(contexto: ExecutionContext): string | null {
        console.log('Extrayendo token desde headers');
        const authHeader = contexto.switchToHttp().getRequest().headers['authorization'];
        if (!authHeader) return null;
        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : null;
    }

    extractTokenFromCookie(contexto: ExecutionContext): string | null {
        console.log('Extrayendo token desde cookies');
        const token = contexto.switchToHttp().getRequest().cookies?.['Token'];
        return token || null;
    }
}