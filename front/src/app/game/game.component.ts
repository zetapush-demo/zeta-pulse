import { Component, OnInit, HostListener } from '@angular/core'
import { GameService } from 'src/services/game.service'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  constructor(private game: GameService) {}

  @HostListener('mousemove', ['$event'])
  onMove(event: any) {
    console.log(event.clientX, event.clientY)
    this.game.move.next({
      id: 'toto',
      x: event.clientX,
      y: event.clientY
    })
  }

  ngOnInit() {}
}
