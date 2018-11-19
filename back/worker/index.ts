import { Messaging, Groups, GroupUsers } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

export interface IRoom {
  name?: string
}

@Injectable()
export default class Api {
  private requestContext: Context
  constructor(private messaging: Messaging, private groups: Groups) {}

  /*
   * Random 4 alpha-numeric id
   */
  generateId() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  async createRoom(room: Partial<IRoom> = {}): Promise<string> {
    const roomId = this.generateId()

    const { exists } = await this.groups.exists({
      group: roomId
    })

    if (exists) {
      return this.createRoom(room)
    }

    await this.groups.createGroup({
      group: roomId,
      groupName: this.requestContext.owner
    })
    return roomId
  }

  async joinRoom(roomId: string) {
    const { exists } = await this.groups.exists({
      group: roomId
    })

    if (!exists) {
      return null
    }

    await this.groups.addUser({
      group: roomId,
      user: this.requestContext.owner
    })
    const group: GroupUsers = await this.groups.groupUsers({
      group: roomId
    })
    const users: string[] = group.users || []

    return {
      users,
      owner: group.groupName,
      callee: this.requestContext.owner
    }
  }

  async sendMessage(request: any) {
    const { roomId, data } = request
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
