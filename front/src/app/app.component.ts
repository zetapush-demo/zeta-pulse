import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/services/api/api.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'zetapulse'

  constructor(private api: ApiService) {}

  ngOnInit() {}
}
