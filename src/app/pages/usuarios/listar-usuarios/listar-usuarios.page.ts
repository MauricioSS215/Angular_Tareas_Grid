import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { listaUsuarios } from '../../../model/listaUsuarios';

@Component({
  imports: [RouterLink],
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
})
export class ListarUsuariosPage {
  public usuarios: Usuario[] = listaUsuarios;

  public eliminarUsuario(usuario: Usuario) {
    console.log('Eliminar usuario (ejemplo sin persistencia):', usuario);
  }
}
