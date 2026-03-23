import { Routes } from '@angular/router';

export const tasksRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/tasks-page/tasks-page.component').then(
        m => m.TasksPageComponent
      ),
  },
];
