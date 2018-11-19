import { Component, OnInit, Input } from '@angular/core'

export interface ITarget {
  id: string
  x: number
  y: number
}

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss']
})
export class TargetComponent implements OnInit {
  @Input() target: ITarget

  constructor() {}

  ngOnInit() {}
}
