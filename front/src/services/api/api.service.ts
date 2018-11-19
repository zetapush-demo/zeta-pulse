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
  move: Subject<IMessage> = new Subject()
  target: Subject<any> = new Subject()

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
        [roomId]: (response: any) => {
          const message: IMessage = response.data
          return this.move.next(message)
        }
      }
    })
    return { response }
  }

  async sendMove(roomId: string, data: IPlayer) {
    const message = await this.worker.sendMessage({ roomId, data })
  }
}
