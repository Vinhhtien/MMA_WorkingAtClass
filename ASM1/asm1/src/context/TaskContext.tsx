/**
 * Task Context
 * Global state management cho task list
 */

import { Category, FilterType, Priority, SortType, Task } from '@/src/types/Task';
import { syncTaskReminders } from '@/src/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const STORAGE_KEY = '@taskflow/tasks-v1';
const BACKUP_STORAGE_KEY = '@taskflow/tasks-v1-backup';

interface StoredTaskData {
  version: 1;
  savedAt: number;
  tasks: Task[];
}

const parseStoredTasks = (value: string | null): Task[] | null => {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as Task[];

    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'tasks' in parsed
      && Array.isArray((parsed as StoredTaskData).tasks)
    ) {
      return (parsed as StoredTaskData).tasks;
    }
  } catch {
    return null;
  }

  return null;
};

const createSampleTasks = (): Task[] => {
  const now = new Date();
  const at = (dayOffset: number, hour: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, 0, 0, 0);
    return date.getTime();
  };

  return [
    {
      id: 'sample-planning',
      title: 'Lập kế hoạch cho tuần mới',
      description: 'Xác định ba mục tiêu quan trọng và thời gian thực hiện.',
      completed: false,
      priority: 'high',
      category: 'work',
      createdAt: now.getTime() - 60 * 60 * 1000,
      updatedAt: now.getTime() - 60 * 60 * 1000,
      dueDate: at(0, 17),
    },
    {
      id: 'sample-shopping',
      title: 'Mua thực phẩm cho gia đình',
      completed: false,
      priority: 'medium',
      category: 'shopping',
      createdAt: now.getTime() - 2 * 60 * 60 * 1000,
      updatedAt: now.getTime() - 2 * 60 * 60 * 1000,
      dueDate: at(1, 18),
    },
    {
      id: 'sample-health',
      title: 'Chạy bộ 30 phút',
      completed: true,
      priority: 'low',
      category: 'health',
      createdAt: now.getTime() - 24 * 60 * 60 * 1000,
      updatedAt: now.getTime() - 3 * 60 * 60 * 1000,
      dueDate: at(0, 6),
    },
  ];
};

export interface TaskContextType {
  tasks: Task[];
  isHydrated: boolean;
  filter: FilterType;
  sortType: SortType;
  searchQuery: string;
  addTask: (title: string, description?: string, priority?: Priority, category?: Category, dueDate?: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  clearAllTasks: () => void;
  toggleComplete: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSortType: (sortType: SortType) => void;
  setSearchQuery: (query: string) => void;
  getFilteredAndSortedTasks: () => Task[];
}

export const TaskContext = createContext<TaskContextType | null>(null);

interface TaskAction {
  type: 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'CLEAR_TASKS' | 'HYDRATE_TASKS' | 'SET_FILTER' | 'SET_SORT' | 'SET_SEARCH' | 'TOGGLE_COMPLETE';
  payload?: any;
}

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  sortType: SortType;
  searchQuery: string;
}

const initialState: TaskState = {
  tasks: [],
  filter: 'all',
  sortType: 'newest',
  searchQuery: '',
};

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: action.payload.title,
        description: action.payload.description,
        completed: false,
        priority: action.payload.priority || 'medium',
        category: action.payload.category || 'personal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        dueDate: action.payload.dueDate,
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
      };
    }
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                ...action.payload.updates,
                updatedAt: Date.now(),
              }
            : task
        ),
      };
    }
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    }
    case 'CLEAR_TASKS':
      return { ...state, tasks: [] };
    case 'HYDRATE_TASKS':
      return { ...state, tasks: action.payload.tasks };
    case 'TOGGLE_COMPLETE': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: Date.now(),
              }
            : task
        ),
      };
    }
    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload.filter,
      };
    }
    case 'SET_SORT': {
      return {
        ...state,
        sortType: action.payload.sortType,
      };
    }
    case 'SET_SEARCH': {
      return {
        ...state,
        searchQuery: action.payload.query,
      };
    }
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedValue, backupValue] = await AsyncStorage.multiGet([
          STORAGE_KEY,
          BACKUP_STORAGE_KEY,
        ]);
        const storedTasks = parseStoredTasks(storedValue[1]);
        const backupTasks = parseStoredTasks(backupValue[1]);
        const tasks = storedTasks ?? backupTasks ?? createSampleTasks();
        dispatch({ type: 'HYDRATE_TASKS', payload: { tasks } });
      } catch (error) {
        console.warn('Không thể đọc dữ liệu công việc:', error);
        dispatch({ type: 'HYDRATE_TASKS', payload: { tasks: createSampleTasks() } });
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const payload: StoredTaskData = {
      version: 1,
      savedAt: Date.now(),
      tasks: state.tasks,
    };
    const serialized = JSON.stringify(payload);

    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const previousValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (previousValue) {
          await AsyncStorage.setItem(BACKUP_STORAGE_KEY, previousValue);
        }
        await AsyncStorage.setItem(STORAGE_KEY, serialized);
      })
      .catch((error) => {
        console.warn('Không thể lưu dữ liệu công việc:', error);
      });
  }, [isHydrated, state.tasks]);

  useEffect(() => {
    if (!isHydrated) return;
    syncTaskReminders(state.tasks);
  }, [isHydrated, state.tasks]);

  const addTask = useCallback(
    (title: string, description?: string, priority?: Priority, category?: Category, dueDate?: number) => {
      dispatch({
        type: 'ADD_TASK',
        payload: { title, description, priority, category, dueDate },
      });
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id, updates },
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_TASK',
      payload: { id },
    });
  }, []);

  const clearAllTasks = useCallback(() => {
    dispatch({ type: 'CLEAR_TASKS' });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    dispatch({
      type: 'TOGGLE_COMPLETE',
      payload: { id },
    });
  }, []);

  const setFilter = useCallback((filter: FilterType) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filter },
    });
  }, []);

  const setSortType = useCallback((sortType: SortType) => {
    dispatch({
      type: 'SET_SORT',
      payload: { sortType },
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({
      type: 'SET_SEARCH',
      payload: { query },
    });
  }, []);

  const getFilteredAndSortedTasks = useCallback((): Task[] => {
    let filtered = state.tasks;

    // Filter by status
    if (state.filter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (state.filter === 'incomplete') {
      filtered = filtered.filter((t) => !t.completed);
    } else if (state.filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (state.filter === 'overdue') {
      const now = Date.now();
      filtered = filtered.filter((t) => !t.completed && t.dueDate && t.dueDate < now);
    }

    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered];
    if (state.sortType === 'newest') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (state.sortType === 'oldest') {
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    } else if (state.sortType === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (state.sortType === 'dueDate') {
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
    }

    return sorted;
  }, [state.tasks, state.filter, state.searchQuery, state.sortType]);

  const value: TaskContextType = {
    tasks: state.tasks,
    isHydrated,
    filter: state.filter,
    sortType: state.sortType,
    searchQuery: state.searchQuery,
    addTask,
    updateTask,
    deleteTask,
    clearAllTasks,
    toggleComplete,
    setFilter,
    setSortType,
    setSearchQuery,
    getFilteredAndSortedTasks,
  };

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingMark}>
          <Text style={styles.loadingMarkText}>TF</Text>
        </View>
        <ActivityIndicator size="small" color="#C8FF3D" />
        <Text style={styles.loadingText}>Đang nạp dữ liệu trên thiết bị...</Text>
      </View>
    );
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#C8FF3D',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  loadingMarkText: {
    color: '#171717',
    fontSize: 20,
    fontWeight: '900',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
