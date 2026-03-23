import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { Task, TasksResponse } from '../models';

const BASE_URL = `${environment.apiUrl}/tasks`;

const mockTask: Task = {
  id: 't1',
  userId: 'u1',
  title: 'Test task',
  description: 'Description',
  status: 'pending',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTasks', () => {
    it('calls GET /tasks with default limit=20', () => {
      const mockResponse: TasksResponse = {
        data: [mockTask],
        nextCursor: null,
        hasMore: false,
      };

      service.getTasks().subscribe(res => {
        expect(res.data).toHaveLength(1);
        expect(res.data[0].id).toBe('t1');
      });

      const req = httpMock.expectOne(r => r.url === BASE_URL && r.params.get('limit') === '20');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('includes cursor param when provided', () => {
      const cursor = '2024-01-15T10:00:00Z';

      service.getTasks(20, cursor).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === BASE_URL &&
        r.params.get('cursor') === cursor
      );
      req.flush({ data: [], nextCursor: null, hasMore: false });
    });
  });

  describe('createTask', () => {
    it('calls POST /tasks and returns the created task', () => {
      service.createTask({ title: 'New task', description: 'Desc' }).subscribe(task => {
        expect(task.id).toBe('t1');
        expect(task.title).toBe('Test task');
      });

      const req = httpMock.expectOne(BASE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New task', description: 'Desc' });
      req.flush({ data: mockTask });
    });
  });

  describe('updateTask', () => {
    it('calls PUT /tasks/:id and returns the updated task', () => {
      const updated: Task = { ...mockTask, status: 'completed' };

      service.updateTask('t1', { status: 'completed' }).subscribe(task => {
        expect(task.status).toBe('completed');
      });

      const req = httpMock.expectOne(`${BASE_URL}/t1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'completed' });
      req.flush({ data: updated });
    });
  });

  describe('deleteTask', () => {
    it('calls DELETE /tasks/:id and completes successfully', () => {
      let completed = false;

      service.deleteTask('t1').subscribe({
        complete: () => { completed = true; },
      });

      const req = httpMock.expectOne(`${BASE_URL}/t1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });

      expect(completed).toBe(true);
    });

    it('propagates HTTP errors from deleteTask', () => {
      let errorStatus: number | undefined;

      service.deleteTask('t1').subscribe({
        error: err => { errorStatus = err.status; },
      });

      const req = httpMock.expectOne(`${BASE_URL}/t1`);
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });
  });
});
