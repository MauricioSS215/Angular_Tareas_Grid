import { Component } from '@angular/core';
import { Usuario } from '../../../model/usuario';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { RouterLink } from '@angular/router';

@Component({
  imports: [UsuarioForm, RouterLink],
  selector: 'app-crear-usuarios',
  styleUrl: './crear-usuarios.page.css',
  templateUrl: './crear-usuarios.page.html',
})
export class CrearUsuariosPage {
  public onGuardarUsuario(usuario: Usuario) {
    console.log('CrearUsuariosPage recibió:', usuario);
  }
}
