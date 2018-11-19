import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-dialog-game',
  templateUrl: './dialog-game.component.html',
  styleUrls: ['./dialog-game.component.scss']
})
export class DialogGameComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogGameComponent>
  ) { }

  ngOnInit() {
  }
  submitName(name) {
    this.dialogRef.close(name)
  }
}
