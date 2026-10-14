import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../model/usuario';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  imports: [UsuarioForm, RouterLink],
  selector: 'app-crear-usuarios',
  styleUrl: './crear-usuarios.page.css',
  templateUrl: './crear-usuarios.page.html',
})
export class CrearUsuariosPage {
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

public usuarioVacio: Usuario = {
  id_usuario: 0,
  username: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  nombre_completo: '',
  grupos: ['user'],
  activo: true,
};

  /*public async onGuardarUsuario(usuario: Usuario) {
    await this.usuarioService.add(usuario);
    await this.router.navigate(['/usuarios']);
  }*/

  public async onGuardarUsuario(usuario: Usuario) {
  await this.usuarioService.add({
    username: usuario.username,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    fecha_nacimiento: usuario.fecha_nacimiento,
    grupos: usuario.grupos,
    password: 'Prueba123',
  });

  await this.router.navigate(['/usuarios']);
}
}
