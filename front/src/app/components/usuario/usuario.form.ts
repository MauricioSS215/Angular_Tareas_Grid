import { Component, input, linkedSignal, output } from '@angular/core';
import { form, FormField, required, minLength, maxLength, pattern } from '@angular/forms/signals';
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
  public usuarioForm = form(this.usuarioModel, (path) => {
    required(path.username, {
      message: 'El username es obligatorio',
    });

    minLength(path.username, 3, {
      message: 'El username debe tener al menos 3 caracteres',
    });

    maxLength(path.username, 30, {
      message: 'El username no puede superar los 30 caracteres',
    });

    pattern(path.username, /^\S+$/, {
      message: 'El username no puede contener espacios',
    });

    required(path.nombres, {
      message: 'El nombre es obligatorio',
    });

    pattern(path.nombres, /\S/, {
      // /\S/ Permite un espacio entre nombre como ana paula
      message: 'El nombre no puede contener solo espacios',
    });

    required(path.apellidos, {
      message: 'El apellido es obligatorio',
    });

    pattern(path.apellidos, /\S/, {
      message: 'El apellido no puede contener solo espacios',
    });

    required(path.fecha_nacimiento, {
      message: 'La fecha de nacimiento es obligatoria',
    });

    minLength(path.grupos, 1, {
      message: 'Seleccioná al menos un grupo',
    });
  });
  public guardarUsuario = output<Usuario>();

  public submitForm(event: Event) {
    event.preventDefault();

    if (this.usuarioForm().invalid() || this.usuarioModel().grupos.length === 0) {
      return;
    }

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
