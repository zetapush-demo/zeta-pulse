import { Component, OnInit, Input } from '@angular/core'
import { ApiService } from '../../services/api/api.service';

export interface IChatMessage {
  text: any,
  ts: number
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @Input() roomId: string
  @Input() messages: IChatMessage[]

  constructor(
    private api: ApiService, // api service connected to worker
  ) {
    this.api.onChatMessage.subscribe((message) => this.onMessage(message))
  }

  ngOnInit() {
  }

  sendMessage(message) {
    this.api.sendMessage(this.roomId, message)
  }
  onMessage(message: IChatMessage) {
    console.info('ChatComponent::onMessage', { message, messages: this.messages })
    this.messages.push(message)
  }
}
