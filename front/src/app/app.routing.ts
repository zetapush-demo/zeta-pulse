import { Routes, CanActivate } from '@angular/router'
import { Injectable } from '@angular/core'

import { AppComponent } from './app.component'
import { GameComponent } from './game/game.component'
import { JoinComponent } from './join/join.component'
import { ApiService } from 'src/services/api/api.service'
import { ChatComponent } from './chat/chat.component'

export const COMPONENTS = [AppComponent, GameComponent, JoinComponent, ChatComponent]

@Injectable({ providedIn: 'root' })
export class IsConnectedGuard implements CanActivate {
  constructor(private api: ApiService) {}

  async canActivate(): Promise<boolean> {
    return this.api
      .connect()
      .then(() => {
        console.info('Api::connected')
        return true
      })
      .catch(() => {
        console.warn('Api::disconnected')
        return false
      })
  }
}

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'join', pathMatch: 'full' },
  { path: 'join', component: JoinComponent, canActivate: [IsConnectedGuard] },
  { path: 'game/:gameId', component: GameComponent, canActivate: [IsConnectedGuard] }
]
