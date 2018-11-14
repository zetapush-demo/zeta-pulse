import { Messaging, Groups, GroupUsers, Stack } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

export interface IRoom {
  name: string
  address: string
  date: string
}

@Injectable()
export default class Api {
  private requestContext: Partial<Context> = {}

  constructor(
    private messaging: Messaging,
    private groups: Groups,
    private stack: Stack
  ) {}

  /*
   * Parse a randomly generated number in string as a base number 36
   */
  private generateId() {
    return Math.random()
      .toString(36)
      .substring(2)
  }

  async createRoom(room: IRoom): Promise<string> {
    const roomId = this.generateId()

    const { exists } = await this.groups.exists({
      group: roomId
    })

    if (exists) return this.createRoom(room)

    await this.groups.createGroup({
      group: roomId
    })
    await this.stack.push({
      stack: roomId,
      data: room
    })
    return roomId
  }

  async joinRoom(roomId: string) {
    const { exists } = await this.groups.exists({
      group: roomId
    })

    if (!exists) return null

    await this.groups.addUser({
      group: roomId,
      user: this.requestContext.owner
    })

    const { result } = (await this.stack.list({
      stack: roomId
    })) as any

    return {
      room: result.content.pop(), // event information at the top of stack
      messages: result.content // the rest of the stack contains messages
    }
  }

  async sendMessage(roomId: string, data: any) {
    const group: GroupUsers = await this.groups.groupUsers({
      group: roomId
    })

    const users: string[] = group.users || []

    this.messaging.send({
      channel: roomId,
      target: users,
      data
    })
  }
}
