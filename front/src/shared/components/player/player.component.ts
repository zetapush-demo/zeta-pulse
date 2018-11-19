import { Component, OnInit, Input, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core'
import { ApiService, IMessage } from 'src/services/api/api.service'
import { filter } from 'rxjs/operators';

export interface IPlayer {
  id?: string
  color?: string
  name?: string
  x: number
  y: number
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() id: string
  player: IPlayer

  constructor(private element: ElementRef<any>, private api: ApiService, private renderer: Renderer2) {
    this.api.onGetPosition
      .pipe(filter((message: IMessage) => message.data.id == this.id))
      .subscribe((message: IMessage) => this.setPosition(message.data))
  }

  ngOnInit() {}

  setPosition(player: IPlayer) {
    this.player = player
    const { id, x, y, name, color } = player
    // this.renderer.setStyle(this.element.nativeElement, 'border-color', player.color)
    this.renderer.setStyle(this.element.nativeElement, 'color', color)
    this.renderer.setStyle(this.element.nativeElement, 'transform', `translate3d(${x}px, ${y}px, 0)`)
  }
}
