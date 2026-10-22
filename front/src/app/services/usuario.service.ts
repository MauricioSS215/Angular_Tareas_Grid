import { inject, Service } from '@angular/core';
import { Usuario, CrearUsuarioDTO, ActualizarUsuarioDTO,UsuariosPaginados } from '../model/usuario';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Service()
export class UsuarioService {
  private baseUrl = environment.apiUrl + '/usuarios';
  private _httpClient = inject(HttpClient); //instancia de HTTPCLIENT

  public async getAll(page = 1, cantidad = 10) {
    return await firstValueFrom(
      this._httpClient.get<UsuariosPaginados>(this.baseUrl, {
        params: { page, cantidad },
      }),
    );
  }

  public async getById(id: number) {
    return await firstValueFrom(this._httpClient.get<Usuario>(`${this.baseUrl}/${id}`));
  }

  /* public async getAll(): Promise<Usuario[]> {
    return [...this.usuarios];
  }

  public async getById(id_usuario: number): Promise<Usuario | undefined> {
    return this.usuarios.find((usuario) => usuario.id_usuario === id_usuario);
  }*/

  /*public async add(usuario: Usuario): Promise<void> {
    const id_usuario = Math.max(0, ...this.usuarios.map((item) => item.id_usuario)) + 1;
    this.usuarios.push({
      ...usuario,
      id_usuario,
      grupos: [...usuario.grupos],
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
    });
  }*/

  public async add(datos: CrearUsuarioDTO) {
    return await firstValueFrom(this._httpClient.post<Usuario>(this.baseUrl, datos));
  }

  /*public async update(id_usuario: number, usuario: Usuario): Promise<void> {
    const indice = this.usuarios.findIndex((item) => item.id_usuario === id_usuario);
    if (indice === -1) throw new Error('Usuario no encontrado');
    this.usuarios[indice] = {
      ...usuario,
      id_usuario,
      grupos: [...usuario.grupos],
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
    };
  }*/

  public async update(id: number, usuarioModificado: ActualizarUsuarioDTO) {
    return await firstValueFrom(
      this._httpClient.patch<Usuario>(`${this.baseUrl}/${id}`, usuarioModificado),
    );
  }

  /*public async remove(id_usuario: number): Promise<void> {
    const tareas = await this.tareasService.getAll();
    if (tareas.some(tarea => tarea.id_creador === id_usuario)) {
      throw new Error('El usuario tiene tareas asociadas. Eliminá sus tareas antes de borrar el usuario.');
    }
    this.usuarios = this.usuarios.filter((usuario) => usuario.id_usuario !== id_usuario);
  }*/

  public async remove(id: number): Promise<void> {
    await firstValueFrom(this._httpClient.delete<void>(`${this.baseUrl}/${id}`));
  }
}
