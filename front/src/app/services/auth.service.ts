import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Grupo } from '../model/usuario';
import { UsuarioLogueado } from '../model/usuario';

@Service()
export class AuthService {
  private baseUrl = environment.apiUrl + '/auth';
  private _httpClient = inject(HttpClient);

  public async doLogin(datos: { username: string; password: string }) {
    const respuesta = await firstValueFrom(
      this._httpClient.post<{ token: string }>(`${this.baseUrl}/login`, datos),
    );

    this.#token.set(respuesta.token);

    return respuesta;
  }

  readonly #token = signal<string | null>(null);

  readonly #user = signal<UsuarioLogueado | null>(null);

  public readonly user = this.#user.asReadonly();

  public readonly token = this.#token.asReadonly();

  public async fetchUser() {
    const usuario = await firstValueFrom(this._httpClient.get<UsuarioLogueado>(`${this.baseUrl}/`));

    this.#user.set(usuario);

    return usuario;
  }
}
