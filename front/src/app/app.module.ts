import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

const ANGULAR = [
  BrowserModule,
  BrowserAnimationsModule,
  FormsModule,
  ReactiveFormsModule
]

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
const MATERIAL = [
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
]

import { AppComponent } from './app.component'
import { ENTRY_COMPONENTS } from '../shared/components'
import { APP_ROUTES, COMPONENTS } from './app.routing'

@NgModule({
  declarations: [...COMPONENTS, ...ENTRY_COMPONENTS],
  imports: [
    RouterModule.forRoot(APP_ROUTES, { useHash: true }),
    ...ANGULAR,
    ...MATERIAL
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [...ENTRY_COMPONENTS]
})
export class AppModule {}
