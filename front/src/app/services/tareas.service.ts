import { Tarea, ActualizarTareaDTO, CrearTareaDTO } from '../model/tarea';
import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class TareasService {
  private baseUrl = environment.apiUrl + '/tareas';

  private _httpClient = inject(HttpClient);

  public async getAll(): Promise<Tarea[]> {
    return await firstValueFrom(this._httpClient.get<Tarea[]>(this.baseUrl));
  }

  public async getById(id: number): Promise<Tarea> {
    return await firstValueFrom(this._httpClient.get<Tarea>(`${this.baseUrl}/${id}`));
  }

  public async add(tareaNueva: CrearTareaDTO): Promise<Tarea> {
    return await firstValueFrom(this._httpClient.post<Tarea>(this.baseUrl, tareaNueva));
  }

  public async update(id: number, tareaModificada: ActualizarTareaDTO) {
    return await firstValueFrom(
      this._httpClient.patch<Tarea>(`${this.baseUrl}/${id}`, tareaModificada),
    );
  }

  public async remove(id: number): Promise<void> {
    await firstValueFrom(this._httpClient.delete<void>(`${this.baseUrl}/${id}`));
  }
}
