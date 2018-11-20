import { Messaging, Groups, GroupUsers, Stack } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

export interface IRoom {
  name?: string
}

@Injectable()
export default class Api {
  private requestContext: Context
  constructor(
    private messaging: Messaging,
    private groups: Groups,
    private stack: Stack
  ) {}

  /*
   * Random 4 alpha-numeric id
   */
  generateId() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  async createRoom(room: Partial<IRoom> = {}): Promise<string> {
    const roomId = this.generateId()

    const { exists } = await this.groups.exists({ group: roomId })

    if (exists) {
      return this.createRoom(room)
    }

    await this.groups.createGroup({
      group: roomId,
      groupName: this.requestContext.owner
    })
    // await this.stack.push({
    // 	stack: roomId,
    // 	data: {
    //     text: `Welcome on chat #${roomId}`
    //   }
    // });
    return roomId
  }

  async joinRoom(roomId: string) {
    console.log('Api::joinRoom', roomId)
    const { exists } = await this.groups.exists({ group: roomId })

    if (!exists) {
      return null
    }

    await this.groups.addUser({
      group: roomId,
      user: this.requestContext.owner
    })
    try {
      const { result } = await this.stack.list({
        stack: roomId
      })
    } catch (exception) {
      console.warn('Worker::joinRoom--error', exception)
    }
    const group: GroupUsers = await this.groups.groupUsers({ group: roomId })
    const users: string[] = group.users || []

    let messages: any[] = []

    // if (result && result.content) {
    //   messages = result.content
    //   // messages = result.content.reverse().map(x => {
    //   //   return {
    //   //     data: x.data,
    //   //     ts: x.ts
    //   //   }
    //   // })
    // }
    return {
      users,
      owner: group.groupName,
      callee: this.requestContext.owner,
      messages
    }
  }
  async sendNewPlayer(request: any) {
    console.log('Api::sendNewPlayer', request)
    const { roomId, player } = request
    this.sendMessage(`new${roomId}`, roomId, player)
  }
  async sendPosition(request: any) {
    console.log('Api::sendPosition', request)
    const { roomId, player } = request
    this.sendMessage(`position${roomId}`, roomId, player)
  }
  async sendChatMessage(request: any) {
    console.log('Api::sendChatMessage', request)
    const { roomId, message } = request
    this.sendMessage(`chat${roomId}`, roomId, {
      name: message.name,
      text: message.text,
      ts: Date.now()
    })
    await this.stack.push({
      stack: roomId,
      data: message
    })
  }

  async sendMessage(channel: string, roomId: string, data: any = {}) {
    const group: GroupUsers = await this.groups.groupUsers({ group: roomId })
    const target: string[] = group.users || []

    this.messaging.send({
      channel,
      target,
      data
    })
  }
}
