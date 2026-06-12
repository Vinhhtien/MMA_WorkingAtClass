/**
 * Validation Utilities
 * Tiện ích xác thực dữ liệu
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate task title
 * - Không được để trống
 * - Tối thiểu 3 ký tự
 * - Tối đa 200 ký tự
 */
export const validateTaskTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    errors.push('Tiêu đề không được để trống');
  } else if (trimmedTitle.length < 3) {
    errors.push('Tiêu đề phải có ít nhất 3 ký tự');
  } else if (trimmedTitle.length > 200) {
    errors.push('Tiêu đề không được vượt quá 200 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate task object
 */
export const validateTask = (title: string, description?: string): ValidationResult => {
  const titleValidation = validateTaskTitle(title);
  
  const errors = [...titleValidation.errors];

  if (description && description.length > 1000) {
    errors.push('Mô tả không được vượt quá 1000 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate priority value
 */
export const validatePriority = (priority: any): ValidationResult => {
  const validPriorities = ['low', 'medium', 'high'];
  
  if (!validPriorities.includes(priority)) {
    return {
      isValid: false,
      errors: ['Mức độ ưu tiên không hợp lệ'],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

/**
 * Validate due date
 */
export const validateDueDate = (dueDate: number | null): ValidationResult => {
  if (dueDate === null) {
    return {
      isValid: true,
      errors: [],
    };
  }

  if (dueDate < Date.now()) {
    return {
      isValid: false,
      errors: ['Ngày hết hạn phải trong tương lai'],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  if (query.length > 100) {
    return {
      isValid: false,
      errors: ['Truy vấn tìm kiếm không được vượt quá 100 ký tự'],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

/**
 * Check if task can be deleted
 */
export const validateTaskDeletion = (taskId: string): ValidationResult => {
  if (!taskId || taskId.trim() === '') {
    return {
      isValid: false,
      errors: ['ID công việc không hợp lệ'],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};
