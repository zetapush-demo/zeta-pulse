import { Injectable } from '@angular/core'
import { Subject, ReplaySubject } from 'rxjs'

import { WeakClient, ProxyService } from '@zetapush/client'
import { Messaging } from '@zetapush/platform-legacy'
import { environment } from 'src/environments/environment'
import { IPlayer } from 'src/shared/components/player/player.component'

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
  client: WeakClient // Instance of connection client
  worker: ProxyService // Instance of api worker
  onGetPosition: Subject<IMessage> = new Subject() // Observable for 'player-position' event
  onNewPlayer: ReplaySubject<IMessage> = new ReplaySubject(1) // Observable for 'new-player' event

  /**
   * Init client and worker instance with env infos
   */
  constructor() {
    this.client = new WeakClient({
      platformUrl: environment.platformUrl,
      appName: environment.appName
    })
    this.worker = this.client.createProxyTaskService()
  }

  /**
   * Init connection to api
   */
  async connect() {
    await this.client.connect()
  }

  /**
   * Create a new room
   */
  async createRoom() {
    const roomId = await this.worker.createRoom()
    return roomId
  }

  /**
   * Join a room and listen to messaging event
   * @param roomId
   */
  async joinRoom(roomId: string) {
    const response = await this.worker.joinRoom(roomId)
    console.info('Api::joinRoom', { response })

    // Listen to messaging channels
    await this.client.createService({
      Type: Messaging,
      listener: {
        // on 'new-player' event
        [`new${roomId}`]: (response: any) => {
          console.info('Api::message--new', response)
          const data: IMessage = response.data
          this.onNewPlayer.next(data)
        },
        // on 'player-position' event
        [`position${roomId}`]: (response: any) => {
          console.info('Api::message--position', response)
          const data: IMessage = response.data
          return this.onGetPosition.next(data)
        }
      }
    })
    return { response }
  }

  /**
   * Event sourcing for messaging channels
   */
  async sendPosition(roomId: string, player: IPlayer) {
    const response = await this.worker.sendPosition({ roomId, player })
  }
  async sendNewPlayer(roomId: string, player: Partial<IPlayer>) {
    const response = await this.worker.sendNewPlayer({ roomId, player })
  }
}
