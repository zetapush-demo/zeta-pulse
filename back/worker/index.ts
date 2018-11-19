import { Messaging, Groups, GroupUsers, Stack } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

export interface IRoom {
  name?: string
}

@Injectable()
export default class Api {
  private requestContext: Context
  constructor(private messaging: Messaging, private groups: Groups, private stack: Stack) {

  }

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
      });
    }
    catch(exception) {
      console.warn('Worker::joinRoom--error', exception)
    }
    const group: GroupUsers = await this.groups.groupUsers({ group: roomId })
    const users: string[] = group.users || []
    this.onNewPlayer(roomId)

    let messages: any[]

		// if (!result || !result.content) {
    //   messages = []
    // }
    // else {
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
			messages: []
    }
  }
  async onNewPlayer(roomId: string) {
    this.sendMessage(`new${roomId}`, roomId)
  }
  async sendPosition(request: any) {
    const { roomId, data } = request
    this.sendMessage(`position${roomId}`, roomId, data)
  }
  async sendChatMessage(request: any) {
    const { roomId, text } = request
    this.sendMessage(`chat${roomId}`, roomId, { text, ts: Date.now() })
    await this.stack.push({
      stack: roomId,
      data: {
        text
      }
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
