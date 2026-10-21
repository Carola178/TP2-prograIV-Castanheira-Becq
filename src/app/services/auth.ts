import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
    })
    export class Auth {

    
        signIn(email: string, password: string) {
        return ({ email, password });
    }

    }