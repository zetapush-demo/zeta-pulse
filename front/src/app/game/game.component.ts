import { Component, OnInit, ElementRef, OnDestroy, ViewChildren, QueryList } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { fromEvent, Subscription } from 'rxjs'
import { throttleTime } from 'rxjs/operators'

import { ApiService, IMessage } from 'src/services/api/api.service'
import { IPlayer, PlayerComponent } from 'src/shared/components/player/player.component'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnDestroy {
  $move: Subscription // Observable for click event

  gameId: string // Group Id
  playerId: string // local player id
  ownerId: string // game owner id
  isOwner: boolean = false
  messages: any[]

  playerColor: string = `hsl(${Math.round(360 * Math.random())}, 50%, 40%)` // random color
  users: string[] = [] // game's users list

  constructor(
    private element: ElementRef, // <app-game> component instance
    private api: ApiService, // api service connected to worker
    private route: ActivatedRoute // angular route listener
  ) {
    this.api.onNewPlayer.subscribe((users) => this.onNewPlayer(users))
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
    this.messages = response.messages

    if (this.playerId == this.ownerId) {
      this.isOwner = true
    }

    if (this.$move) {
      this.$move.unsubscribe()
    }
    this.$move = fromEvent(this.element.nativeElement, 'click')
      .pipe(throttleTime(250))
      .subscribe(event => this.getPosition(event))
  }

  async getPosition(event: any) {
    const data: IPlayer = {
      id: this.playerId,
      color: this.playerColor,
      x: event.clientX,
      y: event.clientY
    }
    await this.api.setPosition(this.gameId, data)
  }
  onNewPlayer(users) {
    this.users = users
  }

  ngOnDestroy() {
    this.$move.unsubscribe()
  }
}
