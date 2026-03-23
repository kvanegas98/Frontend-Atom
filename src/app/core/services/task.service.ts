import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  Task,
  TaskResponse,
  TasksResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../models';

/**
 * Servicio para operaciones CRUD de tareas.
 * Comunica con la API REST protegida por token Bearer (inyectado por el interceptor).
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  /**
   * Obtiene la lista de tareas del usuario autenticado.
   * @param limit Cantidad máxima de tareas a obtener (por defecto 20).
   * @param cursor Cursor de paginación para obtener la siguiente página.
   * @returns Observable con la lista de tareas, cursor siguiente e indicador de más datos.
   */
  getTasks(limit = 20, cursor?: string): Observable<TasksResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<TasksResponse>(this.baseUrl, { params });
  }

  /**
   * Crea una nueva tarea para el usuario autenticado.
   * @param payload Datos de la tarea (título y descripción opcional).
   * @returns Observable con la tarea recién creada.
   */
  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<TaskResponse>(this.baseUrl, payload).pipe(
      map(res => res.data)
    );
  }

  /**
   * Actualiza los datos de una tarea existente.
   * @param id Identificador único de la tarea a actualizar.
   * @param payload Campos a modificar (título, descripción o estado).
   * @returns Observable con la tarea actualizada.
   */
  updateTask(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  /**
   * Elimina una tarea de forma permanente.
   * @param id Identificador único de la tarea a eliminar.
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
