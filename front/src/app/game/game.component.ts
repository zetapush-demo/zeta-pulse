import { Component, OnInit, ElementRef, OnDestroy, ViewChildren, QueryList } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { fromEvent, Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ApiService, IMessage } from 'src/services/api/api.service'
import { IPlayer, PlayerComponent } from 'src/shared/components/player/player.component'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  $move: Subscription // Observable for click event

  gameId: string // Group Id
  playerId: string // local player id
  ownerId: string // game owner id
  isOwner: boolean = false

  playerColor: string = `hsl(${Math.round(360 * Math.random())}, 50%, 40%)` // random color
  users: string[] // game's users list
  activeUsers: PlayerComponent[] = [] // users list filtered on activity
  @ViewChildren(PlayerComponent) players: QueryList<PlayerComponent> //list of player's DOM element

  constructor(
    private element: ElementRef, // <app-game> component instance
    private api: ApiService, // api service connected to worker
    private route: ActivatedRoute // angular route listener
  ) {}

  ngOnInit() {
    // Listen to click event observable to send message
    this.api.move.subscribe(message => this.onMove(message))

    this.route.params.subscribe(params => this.loadGame(params.gameId))
  }

  async loadGame(gameId) {
    this.gameId = gameId
    try {
      const { response } = await this.api.joinRoom(gameId)
      if (response) {
        this.onLoadGame(response)
      } else {
        console.warn('Game::loadGame--not-exist')
      }
    } catch (exception) {
      console.error('Game::loadGame--error', { exception })
    }
  }
  onLoadGame(response) {
    this.playerId = response.callee
    this.ownerId = response.owner
    this.users = response.users

    if (this.playerId == this.ownerId) {
      this.isOwner = true
    }

    if (this.$move) {
      this.$move.unsubscribe()
    }
    this.$move = fromEvent(this.element.nativeElement, 'click')
      .pipe(debounceTime(250))
      .subscribe(event => this.move(event))
  }

  async move(event: any) {
    const data: IPlayer = {
      id: this.playerId,
      color: this.playerColor,
      x: event.clientX,
      y: event.clientY
    }
    const message = await this.api.sendMove(this.gameId, data)
  }

  onMove(message: IMessage) {
    const player: IPlayer = message.data
    this.users = message.target
  }

  getActiveUsers() {
    if (this.players) {
      this.activeUsers = this.players.filter(player => player.active)
    }
  }

  ngOnDestroy() {
    this.$move.unsubscribe()
  }
}
