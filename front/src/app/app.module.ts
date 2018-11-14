import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { GameComponent } from './game/game.component'

import { ENTRY_COMPONENTS } from '../shared/components'

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      { path: '', redirectTo: 'game', pathMatch: 'full' },
      { path: 'game', component: GameComponent }
    ]
  }
]

@NgModule({
  declarations: [AppComponent, GameComponent, ...ENTRY_COMPONENTS],
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [...ENTRY_COMPONENTS]
})
export class AppModule {}
