import { Messaging, Groups, GroupUsers } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

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

  /**
   * Create new group with random Id
   */
  async createRoom(): Promise<string> {
    const roomId = this.generateId()

    // Retry to create group if already exist
    const { exists } = await this.groups.exists({ group: roomId })
    if (exists) {
      return this.createRoom()
    }

    await this.groups.createGroup({
      group: roomId,
      groupName: this.requestContext.owner
    })
    return roomId
  }

  /**
   * Add caller Id to group
   * Get users list
   * @param roomId
   */
  async joinRoom(roomId: string) {
    console.log('Api::joinRoom', roomId)

    // Check if room exist
    const { exists } = await this.groups.exists({ group: roomId })
    if (!exists) {
      return null
    }

    // Add user to room
    await this.groups.addUser({
      group: roomId,
      user: this.requestContext.owner
    })

    // Get group infos and users list
    const group: GroupUsers = await this.groups.groupUsers({ group: roomId })
    const users: string[] = group.users || []

    return {
      users,
      owner: group.groupName,
      callee: this.requestContext.owner
    }
  }

  // 'new-player' event trigger
  async sendNewPlayer(request: any) {
    console.log('Api::sendNewPlayer', request)
    const { roomId, player } = request
    this.sendMessage(`new${roomId}`, roomId, player)
  }
  // 'player-position' event trigger
  async sendPosition(request: any) {
    console.log('Api::sendPosition', request)
    const { roomId, player } = request
    this.sendMessage(`position${roomId}`, roomId, player)
  }

  // Common messaging method for group
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
