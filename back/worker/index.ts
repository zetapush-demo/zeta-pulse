import { Messaging, Groups, GroupUsers, Stack } from '@zetapush/platform-legacy'
import { Injectable, Context } from '@zetapush/core'

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
   * Get users list and chat messages
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
    // Get messages from stack
    const messages: any[] = await this.getMessages(roomId)

    // Get group infos and users list
    const group: GroupUsers = await this.groups.groupUsers({ group: roomId })
    const users: string[] = group.users || []

    return {
      users,
      owner: group.groupName,
      callee: this.requestContext.owner,
      messages
    }
  }

  /**
   * Get and parse chat messages from stack
   * @param roomId
   */
  async getMessages(roomId: string) {
    let messages: any[] = []
    try {
      const { result } = await this.stack.list({
        stack: roomId
      })
      if (result && result.content) {
        messages = result.content.reverse().map(x => {
          return {
            data: x.data,
            ts: x.ts
          }
        })
      }
    } catch (exception) {
      console.warn('Worker::joinRoom--error', exception)
    }
    return messages
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
  // 'new-chat-message' event trigger
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
