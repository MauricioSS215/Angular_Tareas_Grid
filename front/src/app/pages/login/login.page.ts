import { Component, signal, inject } from '@angular/core';
import { form, FormField, required, maxLength } from '@angular/forms/signals';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  imports: [FormField],
  selector: 'app-login',
  styleUrl: './login.page.css',
  templateUrl: './login.page.html',
})
export class LoginPage {
  public loginModel = signal({
    username: '',
    password: '',
  });

  #authService = inject(AuthService);
  #router = inject(Router);

  public loginForm = form(this.loginModel, (path) => {
    required(path.username, {
      message: 'El username es obligatorio',
    });

    maxLength(path.username, 20, {
      message: 'El username no puede superar los 30 caracteres',
    });

    required(path.password, {
      message: 'La contraseña es obligatoria',
    });
  });

  public mensaje = signal('');

  public async submitForm(event: Event) {
    event.preventDefault();
    this.mensaje.set('');

    if (this.loginForm().invalid()) {
      return;
    }

    try {
      const respuesta = await this.#authService.doLogin(this.loginForm().value());
      console.log('Token:', respuesta.token);

      const usuario = await this.#authService.fetchUser();
      console.log('Usuario:', usuario);

      await this.#router.navigate(['/home']);
      
      console.log({ respuesta });
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.mensaje.set(error.error?.message ?? 'No se pudo iniciar sesión.');
      } else {
        this.mensaje.set('No se pudo iniciar sesión.');
      }
    }
  }
}
