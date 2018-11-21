import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ApiService } from '../../services/api/api.service'
import { MatCardContent } from '@angular/material'

export interface IChatMessage {
  name: string
  text: string
  ts?: number
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() roomId: string
  @Input() name: string
  @Input() messages: IChatMessage[]
  @ViewChild('content') content: ElementRef<any>

  constructor(
    private api: ApiService // api service connected to worker
  ) {
    // Listen to 'new-message' event from api
    this.api.onChatMessage.subscribe(message => this.onMessage(message))
  }

  ngOnInit() {}

  /**
   * send 'new-message' event with message data
   * @param text
   */
  sendMessage(input: HTMLInputElement) {
    if (input.value.length == 0) {
      return
    }
    const message = {
      text: input.value,
      name: this.name
    }
    input.value = ''
    this.api.sendChatMessage(this.roomId, message)
  }
  /**
   * push new message to list
   * @param message
   */
  onMessage(message: IChatMessage) {
    console.info('ChatComponent::onMessage', { message, messages: this.messages })
    this.messages.push(message)
    // Async sticky scrolling
    setTimeout(() => {
      const content = this.content.nativeElement
      content.scrollTo(0, content.scrollHeight)
    })
  }
}
