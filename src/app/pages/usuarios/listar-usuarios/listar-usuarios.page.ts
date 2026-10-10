import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  imports: [RouterLink],
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
})
export class ListarUsuariosPage {
  private usuarioService = inject(UsuarioService);

  public usuarioResource = resource({
    defaultValue: [],
    params: () => ({}),
    loader: () => this.usuarioService.getAll(),
  });

  public usuarios = computed(() => this.usuarioResource.value());
  public totalUsuarios = computed(() => this.usuarios().length);

  public async eliminarUsuario(usuario: Usuario) {
    await this.usuarioService.remove(usuario.id_usuario);
    this.usuarioResource.reload();
  }
}
