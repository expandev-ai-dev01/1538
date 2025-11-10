export * from './components/TaskForm';
export * from './components/TaskList';
export * from './hooks/useTaskList';
export * from './hooks/useTaskCreate';
export * from './services/taskService';
export * from './types';

export const moduleMetadata = {
  name: 'task',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: ['TaskForm', 'TaskList'],
  publicHooks: ['useTaskList', 'useTaskCreate'],
  publicServices: ['taskService'],
  dependencies: {
    internal: ['@/core/lib/api', '@/core/lib/queryClient'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query', 'date-fns'],
    domains: [],
  },
  exports: {
    components: ['TaskForm', 'TaskList'],
    hooks: ['useTaskList', 'useTaskCreate'],
    services: ['taskService'],
    types: ['Task', 'CreateTaskDto', 'TaskListParams', 'TaskRecurrence'],
  },
} as const;
