import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core'
import { GameService } from 'src/services/game.service'

export interface IPlayer {
  id: string
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

  constructor(
    private element: ElementRef<any>,
    private game: GameService,
    private renderer: Renderer2
  ) {
    this.game.move.subscribe(this.onMove.bind(this))
  }

  ngOnInit() {}

  onMove(player: IPlayer) {
    const { id, x, y } = player
    if (this.id == id) {
      console.warn(player, this.element.nativeElement)
      this.renderer.setStyle(
        this.element.nativeElement,
        'transform',
        `translate3d(${x}px, ${y}px, 0)`
      )
    }
  }
}
