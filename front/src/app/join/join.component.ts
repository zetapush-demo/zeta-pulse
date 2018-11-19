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

  async join() {
    console.info('JoinComponent::join', { gameId: this.gameId })
    this.router.navigate(['game', this.gameId])
  }

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
