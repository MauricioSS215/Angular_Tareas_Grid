import { Component, computed, inject, input, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  imports: [UsuarioForm, RouterLink],
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.page.html',
})
export class EditarUsuariosPage {
  public id_usuario = input.required<number, string>({
    transform: (value) => Number(value),
  });

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  public usuarioResource = resource({
    params: () => {
      const id_usuario = this.id_usuario();
      if (!id_usuario) return undefined;
      return { id_usuario };
    },
    loader: ({ params }) => this.usuarioService.getById(params.id_usuario),
  });

  public usuario = computed(() => this.usuarioResource.value());

  public async onGuardarUsuario(usuario: Usuario) {
    await this.usuarioService.update(this.id_usuario(), {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      fecha_nacimiento: usuario.fecha_nacimiento,
      grupos: usuario.grupos,
      activo: usuario.activo,
    });

    await this.router.navigate(['/usuarios']);
  }
}
