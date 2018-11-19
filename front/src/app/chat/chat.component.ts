import { Component, OnInit, Input } from '@angular/core'
import { ApiService } from '../../services/api/api.service';

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

  constructor(
    private api: ApiService, // api service connected to worker
  ) {
    this.api.onChatMessage.subscribe((message) => this.onMessage(message))
  }

  ngOnInit() {
  }

  sendMessage(text) {
    const message = {
      text, 
      name: this.name
    }
    this.api.sendChatMessage(this.roomId, message)
  }
  onMessage(message: IChatMessage) {
    console.info('ChatComponent::onMessage', { message, messages: this.messages })
    this.messages.push(message)
  }
}
