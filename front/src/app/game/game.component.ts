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

  roomId: string // Group Id
  // player object
  player: Partial<IPlayer> = {
    color: `hsl(${Math.round(360 * Math.random())}, 50%, 40%)` // random player color
  }
  ownerId: string // game owner id
  messages: any[]

  users: string[] = [] // game's users list
  @ViewChild('game') game // html game container

  constructor(
    private api: ApiService, // api service connected to worker
    private route: ActivatedRoute, // angular route listener
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    // Listen to 'new player' event from worker
    this.api.onNewPlayer.subscribe(message => this.onNewPlayer(message))
    // Observe route param to load game base on roomId in url
    this.route.params.subscribe(params => this.loadGame(params.roomId))
  }

  /**
   * Init game state
   * @param roomId
   */
  async loadGame(roomId) {
    this.roomId = roomId
    await this.joinGame()
    this.initPlayer()
  }

  /**
   * Call api to add current user to roomId
   */
  async joinGame() {
    try {
      const { response } = await this.api.joinRoom(this.roomId)
      if (response) {
        this.initGame(response)
        console.info('Game::loadGame--success')
      } else {
        console.warn('Game::loadGame--not-found')
      }
    } catch (exception) {
      console.error('Game::loadGame--error', { exception })
    }
  }

  /**
   * Init player state and send 'new-player' event to other users
   */
  initPlayer() {
    // Check for local cached player state
    const player = JSON.parse(localStorage.getItem(this.roomId))
    if (player) {
      this.player = player
      this.api.sendNewPlayer(this.roomId, this.player)
      return
    }
    // Else ask for name and init player random position / cache
    const dialogRef = this.dialog.open(DialogGameComponent, { disableClose: true })
    dialogRef.afterClosed().subscribe(name => {
      this.player.name = name
      this.player.x = Math.round(Math.random() * (window.innerWidth * 0.5))
      this.player.y = Math.round(Math.random() * (window.innerHeight * 0.5))
      localStorage.setItem(this.roomId, JSON.stringify(this.player))
      this.api.sendNewPlayer(this.roomId, this.player)
    })
  }

  /**
   * Get infos from room and init event handler
   */
  initGame(response) {
    // set owner id, player id, users, messages from chat
    this.player.roomId = this.roomId
    this.player.id = response.callee
    this.ownerId = response.owner
    this.users = response.users
    this.messages = response.messages

    // Handle click event on <#game> element
    if (this.$move) {
      this.$move.unsubscribe()
    }
    this.$move = fromEvent(this.game.nativeElement, 'click')
      .pipe(throttleTime(250))
      .subscribe(event => this.getPosition(event))
  }

  /**
   * Send new position on click event
   */
  async getPosition(event: any) {
    const { id, name, color } = this.player
    const data: IPlayer = {
      id,
      color,
      name,
      x: event.clientX,
      y: event.clientY
    }
    localStorage.setItem(this.roomId, JSON.stringify(data))
    await this.api.sendPosition(this.roomId, data)
  }

  /**
   * Update users list on 'new-player' event
   * @param message
   */
  onNewPlayer(message: IMessage) {
    this.users = message.target
  }

  async copyRoomId() {
    try {
      await navigator['clipboard'].writeText(this.roomId)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Destroy click handler
  ngOnDestroy() {
    this.$move.unsubscribe()
  }
}
