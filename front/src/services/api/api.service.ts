import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

import { WeakClient, ProxyService } from '@zetapush/client'
import { Messaging } from '@zetapush/platform-legacy'
import { environment } from 'src/environments/environment'
import { IPlayer } from 'src/shared/components/player/player.component'
import { ITarget } from 'src/shared/components/target/target.component'
import { IChatMessage } from '../../app/chat/chat.component';

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
  onNewPlayer: Subject<IMessage> = new Subject()
  onChatMessage: Subject<IChatMessage> = new Subject()

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

  async joinRoom(roomId: string, player: Partial<IPlayer>) {
    const response = await this.worker.joinRoom({ roomId, player })
    console.info('Api::joinRoom', { response })

    await this.client.createService({
      Type: Messaging,
      listener: {
        [`new${roomId}`]: (response: any) => {
          const data: IMessage = response.data
          this.onNewPlayer.next(data)
        },
        [`position${roomId}`]: (response: any) => {
          const data: IMessage = response.data
          return this.onGetPosition.next(data)
        },
        [`chat${roomId}`]: (response: any) => {
          const data: IMessage = response.data
          const message: IChatMessage = data.data
          this.onChatMessage.next(message)
          console.warn('chat', message)
        }
      }
    })
    return { response }
  }

  async setPosition(roomId: string, data: IPlayer) {
    const response = await this.worker.sendPosition({ roomId, data })
  }
  async sendChatMessage(roomId: string, message: IChatMessage) {
    const response = await this.worker.sendChatMessage({ roomId, message })
  }
}
