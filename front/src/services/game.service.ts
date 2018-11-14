import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { IPlayer } from 'src/shared/components/player/player.component'

@Injectable({
  providedIn: 'root'
})
export class GameService {
  move: Subject<IPlayer> = new Subject()

  constructor() {}
}
