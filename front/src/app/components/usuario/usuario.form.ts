import { Component, input, linkedSignal, output } from '@angular/core';
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
  public usuario = input.required<Usuario>();
  public usuarioModel = linkedSignal<Usuario>(() => ({ ...this.usuario() }));
  public usuarioForm = form(this.usuarioModel);
  public guardarUsuario = output<Usuario>();

  public submitForm(event: Event) {
    event.preventDefault();
    this.guardarUsuario.emit(this.usuarioForm().value());
  }
}
