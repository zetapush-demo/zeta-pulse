import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/services/api/api.service'
import { Route, Router } from '@angular/router'

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {
  gameId: string

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {}

  /**
   * Change route to /game/:id
   */
  join() {
    console.info('JoinComponent::join', { gameId: this.gameId })
    this.router.navigate(['game', this.gameId])
  }

  /**
   * Create new room and change route to /game/:id
   */
  async create() {
    console.info('JoinComponent::create--start')
    try {
      const gameId = await this.api.createRoom()
      console.info('JoinComponent::create--done', { gameId })
      this.router.navigate(['game', gameId])
    } catch (exception) {
      console.error('JoinComponent::create--error', { exception })
    }
  }
}
