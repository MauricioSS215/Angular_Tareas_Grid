import { Component, Input, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../../model/usuario';

@Component({
  imports: [FormField, JsonPipe],
  selector: 'app-usuario-form',
  styleUrl: './usuario.form.css',
  templateUrl: './usuario.form.html',
})
export class UsuarioForm {
  public usuarioModel = signal<Usuario>({
    id_usuario: 0,
    nombre: '',
    apellido: '',
    username: '',
  });

  public usuarioForm = form(this.usuarioModel);
  public guardarUsuario = output<Usuario>();

  // En edición, la página envía los datos que debe mostrar el formulario.
  @Input()
  set usuarioInicial(usuario: Usuario) {
    this.usuarioModel.set({ ...usuario });
  }

  public submitForm(event: Event) {
    event.preventDefault();
    this.guardarUsuario.emit(this.usuarioForm().value());
  }
}
