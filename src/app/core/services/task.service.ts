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

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  getTasks(limit = 20, cursor?: string): Observable<TasksResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    if (cursor) {
      params = params.set('cursor', cursor);
    }
    return this.http.get<TasksResponse>(this.baseUrl, { params });
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<TaskResponse>(this.baseUrl, payload).pipe(
      map(res => res.data)
    );
  }

  updateTask(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
