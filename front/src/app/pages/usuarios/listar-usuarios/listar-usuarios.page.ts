import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Usuario, UsuariosPaginados } from '../../../model/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  imports: [RouterLink],
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
})
export class ListarUsuariosPage {
  private usuarioService = inject(UsuarioService);

  public page = signal(1);
  public cantidad = signal(5);

  public usuarioResource = resource<UsuariosPaginados, { page: number; cantidad: number }>({
    defaultValue: {
      usuarios: [],
      total: 0,
      page: 1,
      cantidad: 10,
      totalPaginas: 0,
    },
    params: () => ({
      page: this.page(),
      cantidad: this.cantidad(),
    }),
    loader: ({ params }) => this.usuarioService.getAll(params.page, params.cantidad),
  });

  public usuarios = computed(() => this.usuarioResource.value().usuarios);
  public totalUsuarios = computed(() => this.usuarioResource.value().total);
  public totalPaginas = computed(() => this.usuarioResource.value().totalPaginas);


  public errorEliminar = signal('');

  public async eliminarUsuario(usuario: Usuario) {
    this.errorEliminar.set('');
    try {
      await this.usuarioService.remove(usuario.id_usuario);
      this.usuarioResource.reload();
    } catch (error) {
      this.errorEliminar.set(
        error instanceof Error ? error.message : 'No se pudo eliminar el usuario.',
      );
    }
  }
}
