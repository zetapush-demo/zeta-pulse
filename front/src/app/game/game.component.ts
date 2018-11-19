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
  playerId: string // player id
  playerName: string // player name
  ownerId: string // game owner id
  isOwner: boolean = false
  messages: any[]

  playerColor: string = `hsl(${Math.round(360 * Math.random())}, 50%, 40%)` // random color
  users: string[] = [] // game's users list
  @ViewChild('game') game // html game container

  constructor(
    private api: ApiService, // api service connected to worker
    private route: ActivatedRoute, // angular route listener
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.api.onNewPlayer.subscribe((users) => this.onNewPlayer(users))
    this.route.params.subscribe(params => this.loadGame(params.gameId))
  }

  async loadGame(gameId) {
    this.gameId = gameId
    await this.joinGame()
    await this.askName()
  }
  async askName() {
    return new Promise((resolve, reject) => {
      const dialogRef = this.dialog.open(DialogGameComponent, { disableClose: true })

      dialogRef.afterClosed().subscribe(result => {
        this.playerName = result
        resolve()
      })
    })
  }
  async joinGame() {
    try {
      const { response } = await this.api.joinRoom(this.gameId)
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
    this.$move = fromEvent(this.game.nativeElement, 'click')
      .pipe(throttleTime(250))
      .subscribe(event => this.getPosition(event))
  }

  async getPosition(event: any) {
    const data: IPlayer = {
      id: this.playerId,
      color: this.playerColor,
      name: this.playerName,
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
