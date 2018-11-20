import { Routes, CanActivate } from '@angular/router'
import { Injectable } from '@angular/core'

import { ApiService } from 'src/services/api/api.service'

import { AppComponent } from './app.component'
import { GameComponent } from './game/game.component'
import { JoinComponent } from './join/join.component'

export const COMPONENTS = [AppComponent, GameComponent, JoinComponent]

/**
 * Connect to api on route loading
 */
@Injectable({ providedIn: 'root' })
export class IsConnectedGuard implements CanActivate {
  constructor(private api: ApiService) {}

  async canActivate(): Promise<boolean> {
    this.showLoader()
    return this.api
      .connect()
      .then(() => {
        console.info('Api::connected')
        this.hideLoader()
        return true
      })
      .catch(() => {
        console.warn('Api::disconnected')
        this.hideLoader()
        return false
      })
  }

  showLoader() {
    document.getElementById('loader').classList.remove('off')
  }
  hideLoader() {
    document.getElementById('loader').classList.add('off')
  }
}

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: 'join', pathMatch: 'full' },
  { path: 'join', component: JoinComponent, canActivate: [IsConnectedGuard] },
  { path: 'game/:roomId', component: GameComponent, canActivate: [IsConnectedGuard] }
]
