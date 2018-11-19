import { Component, ElementRef, OnDestroy, ViewChildren, QueryList, ViewChild, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MatDialog } from '@angular/material'
import { fromEvent, Subscription } from 'rxjs'
import { throttleTime } from 'rxjs/operators'

import { ApiService, IMessage } from 'src/services/api/api.service'
import { IPlayer, PlayerComponent } from 'src/shared/components/player/player.component'
import { DialogGameComponent } from '../../shared/components/dialog-game/dialog-game.component'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  $move: Subscription // Observable for click event

  gameId: string // Group Id
  player: Partial<IPlayer> = {
    color: `hsl(${Math.round(360 * Math.random())}, 50%, 40%)` // random player color
  }
  ownerId: string // game owner id
  isOwner: boolean = false
  messages: any[]

  users: string[] = [] // game's users list
  @ViewChild('game') game // html game container

  constructor(
    private api: ApiService, // api service connected to worker
    private route: ActivatedRoute, // angular route listener
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.api.onNewPlayer.subscribe((message) => this.onNewPlayer(message))
    this.route.params.subscribe(params => this.loadGame(params.gameId))
  }

  async loadGame(gameId) {
    this.gameId = gameId
    await this.joinGame()
    this.askName()
  }
  askName() {
    const dialogRef = this.dialog.open(DialogGameComponent, { disableClose: true })

    dialogRef.afterClosed().subscribe(name => {
      this.player.name = name
    })
  }
  async joinGame() {
    try {
      this.player.x = Math.round(Math.random() * window.innerWidth)
      this.player.y = Math.round(Math.random() * window.innerHeight)
      const { response } = await this.api.joinRoom(this.gameId, this.player)
      if (response) {
        this.onLoadGame(response)
      } else {
        console.warn('Game::loadGame--not-found')
      }
    } catch (exception) {
      console.error('Game::loadGame--error', { exception })
    }
  }
  onLoadGame(response) {
    this.player.id = response.callee
    this.ownerId = response.owner
    this.users = response.users
    this.messages = response.messages

    if (this.player.id == this.ownerId) {
      this.isOwner = true
    }

    if (this.$move) {
      this.$move.unsubscribe()
    }
    this.$move = fromEvent(this.game.nativeElement, 'click')
      .pipe(throttleTime(250))
      .subscribe(event => this.getPosition(event))
  }

  async getPosition(event: any) {
    const { id, name, color } = this.player
    const data: IPlayer = {
      id,
      color,
      name,
      x: event.clientX,
      y: event.clientY
    }
    await this.api.setPosition(this.gameId, data)
  }
  onNewPlayer(message: IMessage) {
    this.users = message.target
  }

  ngOnDestroy() {
    this.$move.unsubscribe()
  }
}
