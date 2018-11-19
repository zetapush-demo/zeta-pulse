import { Component, OnInit, Input, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core'
import { ApiService } from 'src/services/api/api.service'

export interface IPlayer {
  id?: string
  color?: string
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
  @Output() onHide: EventEmitter<any> = new EventEmitter()
  @Output() onShow: EventEmitter<any> = new EventEmitter()

  timeout: any
  active: boolean = false
  activeTime: number = 20000

  constructor(private element: ElementRef<any>, private api: ApiService, private renderer: Renderer2) {
    this.api.move.subscribe(this.onMove.bind(this))
  }

  ngOnInit() {}

  onMove(player: IPlayer) {
    const { id, x, y } = player
    if (this.id == id) {
      this.showPlayer()

      // this.renderer.setStyle(this.element.nativeElement, 'border-color', player.color)
      this.renderer.setStyle(this.element.nativeElement, 'color', player.color)
      this.renderer.setStyle(this.element.nativeElement, 'transform', `translate3d(${x}px, ${y}px, 0)`)
    }
  }

  showPlayer() {
    clearTimeout(this.timeout)
    this.active = true
    this.element.nativeElement.classList.remove('off')
    this.onShow.next()

    this.timeout = setTimeout(() => {
      this.hidePlayer()
    }, this.activeTime)
  }
  hidePlayer() {
    this.element.nativeElement.classList.add('off')
    // wait animation end to refresh active players
    setTimeout(() => {
      this.active = false
      this.onHide.next()
    }, 1000)
  }
}
