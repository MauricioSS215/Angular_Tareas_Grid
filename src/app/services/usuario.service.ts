import { Service } from '@angular/core';
import { Usuario } from '../model/usuario';
import { listaUsuarios } from '../model/listaUsuarios';

@Service()
export class UsuarioService {
  // Datos locales hasta completar la API del parcial.
  private usuarios: Usuario[] = listaUsuarios.map((usuario) => ({ ...usuario }));

  public async getAll(): Promise<Usuario[]> {
    return [...this.usuarios];
  }

  public async getById(id_usuario: number): Promise<Usuario | undefined> {
    return this.usuarios.find((usuario) => usuario.id_usuario === id_usuario);
  }

  public async add(usuario: Usuario): Promise<void> {
    const id_usuario = Math.max(0, ...this.usuarios.map((item) => item.id_usuario)) + 1;
    this.usuarios.push({ ...usuario, id_usuario });
  }

  public async update(id_usuario: number, usuario: Usuario): Promise<void> {
    const indice = this.usuarios.findIndex((item) => item.id_usuario === id_usuario);
    if (indice === -1) throw new Error('Usuario no encontrado');
    this.usuarios[indice] = { ...usuario, id_usuario };
  }

  public async remove(id_usuario: number): Promise<void> {
    this.usuarios = this.usuarios.filter((usuario) => usuario.id_usuario !== id_usuario);
  }
}
