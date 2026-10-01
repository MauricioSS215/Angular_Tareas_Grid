import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { listaUsuarios } from '../../../model/listaUsuarios';
import { UsuarioForm } from '../../../components/usuario/usuario.form';

@Component({
  imports: [UsuarioForm, RouterLink],
  selector: 'app-editar-usuarios',
  templateUrl: './editar-usuarios.page.html',
})
export class EditarUsuariosPage implements OnDestroy {
  private route = inject(ActivatedRoute);
  public usuario = signal<Usuario | undefined>(undefined);

  // Al abrir la página o cambiar el ID, buscamos el registro en la lista.
  private parametros = this.route.paramMap.subscribe((params) => {
    const id = Number(params.get('id_usuario'));
    const usuarioEncontrado = listaUsuarios.find((item) => item.id_usuario === id);
    this.usuario.set(usuarioEncontrado);
  });

  public onGuardarUsuario(usuario: Usuario) {
    console.log('EditarUsuariosPage recibió:', usuario);
  }

  ngOnDestroy() {
    this.parametros.unsubscribe();
  }
}
