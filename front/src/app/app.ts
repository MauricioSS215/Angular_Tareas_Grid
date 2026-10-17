import { RouterOutlet, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  public readonly authService = inject(AuthService);
}
