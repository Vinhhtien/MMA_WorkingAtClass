/**
 * Task Type Definition
 * Định nghĩa cấu trúc dữ liệu cho một nhiệm vụ
 */

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  tags?: string[];
  attachments?: string[];
}

export interface TaskDetailWithStats extends Task {
  createdDaysAgo: number;
  daysUntilDue?: number;
}

/**
 * Filter type for task filtering
 * Loại bộ lọc cho việc lọc nhiệm vụ
 */
export type FilterType = 'all' | 'completed' | 'incomplete' | 'today' | 'overdue';

/**
 * Sort type for task sorting
 * Loại sắp xếp cho việc sắp xếp nhiệm vụ
 */
export type SortType = 'newest' | 'oldest' | 'priority' | 'dueDate';
