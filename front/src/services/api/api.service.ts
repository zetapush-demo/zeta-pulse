import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

import { WeakClient, ProxyService } from '@zetapush/client'
import { Messaging } from '@zetapush/platform-legacy'
import { environment } from 'src/environments/environment'
import { IPlayer } from 'src/shared/components/player/player.component'
import { ITarget } from 'src/shared/components/target/target.component'

export interface IRoom {
  name?: string
}

export interface IMessage {
  channel: string
  data: any
  source: string
  target: string[]
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  client: WeakClient
  worker: ProxyService
  onGetPosition: Subject<IMessage> = new Subject()
  onNewPlayer: Subject<string[]> = new Subject()

  constructor() {
    this.client = new WeakClient({
      platformUrl: environment.platformUrl,
      appName: environment.appName
    })
    this.worker = this.client.createProxyTaskService()
  }

  async connect() {
    await this.client.connect()
  }

  async createRoom(room: Partial<IRoom> = {}) {
    const roomId = await this.worker.createRoom(room)
    return roomId
  }

  async joinRoom(roomId: string) {
    const response = await this.worker.joinRoom(roomId)

    await this.client.createService({
      Type: Messaging,
      listener: {
        [`new${roomId}`]: (response: any) => {
          const message: IMessage = response.data
          this.onNewPlayer.next(message.target)
        },
        [`position${roomId}`]: (response: any) => {
          const message: IMessage = response.data
          return this.onGetPosition.next(message)
        }
      }
    })
    return { response }
  }

  async setPosition(roomId: string, data: IPlayer) {
    const message = await this.worker.sendPosition({ roomId, data })
  }
}
