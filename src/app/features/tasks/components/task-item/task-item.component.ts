import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { Task } from '../../../../core/models';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

const DESC_LIMIT = 120;

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    FormatDatePipe,
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;

  @Output() toggleStatus = new EventEmitter<Task>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  readonly expanded = signal(false);

  get isCompleted(): boolean {
    return this.task.status === 'completed';
  }

  get isLongDescription(): boolean {
    return (this.task.description?.length ?? 0) > DESC_LIMIT;
  }

  get visibleDescription(): string {
    if (!this.task.description) return '';
    if (this.expanded() || !this.isLongDescription) return this.task.description;
    return this.task.description.slice(0, DESC_LIMIT) + '…';
  }

  onToggle(): void {
    this.toggleStatus.emit(this.task);
  }

  onEdit(): void {
    this.editTask.emit(this.task);
  }

  onDelete(): void {
    this.deleteTask.emit(this.task);
  }
}
