import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { Grupo, Usuario } from '../../model/usuario';
@Component({
  imports: [FormField, JsonPipe],
  selector: 'app-usuario-form',
  styleUrl: './usuario.form.css',
  templateUrl: './usuario.form.html',
})
export class UsuarioForm {
  public usuario = input.required<Usuario>();
  public usuarioModel = linkedSignal<Usuario>(() => ({
    ...this.usuario(),
    grupos: [...this.usuario().grupos],
  }));
  public usuarioForm = form(this.usuarioModel);
  public guardarUsuario = output<Usuario>();

  public submitForm(event: Event) {
    event.preventDefault();
    this.guardarUsuario.emit(this.usuarioForm().value());
  }
  public grupos: Grupo[] = ['user', 'admin', 'superadmin'];

  public onGrupoToggle(grupo: Grupo, event: Event) {
    const seleccionado = (event.target as HTMLInputElement).checked;
    const gruposActuales = this.usuarioModel().grupos;

    const nuevosGrupos = seleccionado
      ? [...gruposActuales, grupo]
      : gruposActuales.filter((item) => item !== grupo);

    this.usuarioForm.grupos().value.set(nuevosGrupos);
  }
}
