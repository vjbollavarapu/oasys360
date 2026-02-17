/**
 * API Request/Response Transformers for OASYS Platform
 * Handles data transformation, formatting, and validation
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Types for transformers
export interface TransformConfig {
  dateFields?: readonly string[];
  booleanFields?: readonly string[];
  numberFields?: readonly string[];
  arrayFields?: readonly string[];
  objectFields?: readonly string[];
  excludeFields?: readonly string[];
  includeFields?: readonly string[];
}

export interface RequestTransformOptions {
  snakeCase?: boolean;
  camelCase?: boolean;
  dateFormat?: 'iso' | 'timestamp' | 'custom';
  customDateFormat?: string;
  excludeNulls?: boolean;
  excludeUndefined?: boolean;
}

export interface ResponseTransformOptions {
  snakeCase?: boolean;
  camelCase?: boolean;
  dateFormat?: 'iso' | 'timestamp' | 'custom';
  customDateFormat?: string;
  parseNumbers?: boolean;
  parseBooleans?: boolean;
}

// Utility functions for case conversion
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Deep case conversion for objects
export const deepToSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepToSnakeCase);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toSnakeCase(key)] = deepToSnakeCase(value);
    }
    return result;
  }
  return obj;
};

export const deepToCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepToCamelCase);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamelCase(key)] = deepToCamelCase(value);
    }
    return result;
  }
  return obj;
};

// Date transformation utilities
export const formatDate = (date: any, format: 'iso' | 'timestamp' | 'custom' = 'iso', customFormat?: string): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  switch (format) {
    case 'iso':
      return dateObj.toISOString();
    case 'timestamp':
      return dateObj.getTime().toString();
    case 'custom':
      if (customFormat) {
        // Simple custom format implementation
        return customFormat
          .replace('YYYY', dateObj.getFullYear().toString())
          .replace('MM', (dateObj.getMonth() + 1).toString().padStart(2, '0'))
          .replace('DD', dateObj.getDate().toString().padStart(2, '0'))
          .replace('HH', dateObj.getHours().toString().padStart(2, '0'))
          .replace('mm', dateObj.getMinutes().toString().padStart(2, '0'))
          .replace('ss', dateObj.getSeconds().toString().padStart(2, '0'));
      }
      return dateObj.toISOString();
    default:
      return dateObj.toISOString();
  }
};

export const parseDate = (dateString: string, format: 'iso' | 'timestamp' | 'custom' = 'iso'): Date | null => {
  if (!dateString) return null;

  try {
    switch (format) {
      case 'iso':
        return new Date(dateString);
      case 'timestamp':
        return new Date(parseInt(dateString));
      case 'custom':
        // Simple custom date parsing
        return new Date(dateString);
      default:
        return new Date(dateString);
    }
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return null;
  }
};

// Field filtering utilities
export const filterFields = (obj: any, fields: string[], include: boolean = true): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => filterFields(item, fields, include));

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const shouldInclude = include ? fields.includes(key) : !fields.includes(key);
    if (shouldInclude) {
      result[key] = value;
    }
  }
  return result;
};

// Data type conversion utilities
export const convertToNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const convertToBoolean = (value: any): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return null;
};

// Request transformer
export class RequestTransformer {
  private options: RequestTransformOptions;

  constructor(options: RequestTransformOptions = {}) {
    this.options = {
      snakeCase: true,
      camelCase: false,
      dateFormat: 'iso',
      excludeNulls: true,
      excludeUndefined: true,
      ...options,
    };
  }

  transform(data: any, config?: TransformConfig): any {
    if (!data) return data;

    let transformed = { ...data };

    // Apply field filtering
    if (config?.excludeFields) {
      transformed = filterFields(transformed, config.excludeFields, false);
    }
    if (config?.includeFields) {
      transformed = filterFields(transformed, config.includeFields, true);
    }

    // Apply case conversion
    if (this.options.snakeCase) {
      transformed = deepToSnakeCase(transformed);
    } else if (this.options.camelCase) {
      transformed = deepToCamelCase(transformed);
    }

    // Apply date formatting
    if (config?.dateFields) {
      transformed = this.transformDates(transformed, config.dateFields);
    }

    // Apply boolean conversion
    if (config?.booleanFields) {
      transformed = this.transformBooleans(transformed, config.booleanFields);
    }

    // Apply number conversion
    if (config?.numberFields) {
      transformed = this.transformNumbers(transformed, config.numberFields);
    }

    // Remove null/undefined values
    if (this.options.excludeNulls || this.options.excludeUndefined) {
      transformed = this.removeNulls(transformed);
    }

    return transformed;
  }

  private transformDates(obj: any, dateFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.transformDates(item, dateFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (dateFields.includes(key) && value) {
        result[key] = formatDate(value, this.options.dateFormat, this.options.customDateFormat);
      } else {
        result[key] = this.transformDates(value, dateFields);
      }
    }
    return result;
  }

  private transformBooleans(obj: any, booleanFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.transformBooleans(item, booleanFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (booleanFields.includes(key)) {
        result[key] = convertToBoolean(value);
      } else {
        result[key] = this.transformBooleans(value, booleanFields);
      }
    }
    return result;
  }

  private transformNumbers(obj: any, numberFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.transformNumbers(item, numberFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (numberFields.includes(key)) {
        result[key] = convertToNumber(value);
      } else {
        result[key] = this.transformNumbers(value, numberFields);
      }
    }
    return result;
  }

  private removeNulls(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.removeNulls(item)).filter(item => item !== null);

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.options.excludeNulls && value === null) continue;
      if (this.options.excludeUndefined && value === undefined) continue;
      result[key] = this.removeNulls(value);
    }
    return result;
  }
}

// Response transformer
export class ResponseTransformer {
  private options: ResponseTransformOptions;

  constructor(options: ResponseTransformOptions = {}) {
    this.options = {
      camelCase: true,
      snakeCase: false,
      dateFormat: 'iso',
      parseNumbers: true,
      parseBooleans: true,
      ...options,
    };
  }

  transform(data: any, config?: TransformConfig): any {
    if (!data) return data;

    let transformed = { ...data };

    // Apply case conversion
    if (this.options.camelCase) {
      transformed = deepToCamelCase(transformed);
    } else if (this.options.snakeCase) {
      transformed = deepToSnakeCase(transformed);
    }

    // Apply field filtering
    if (config?.excludeFields) {
      transformed = filterFields(transformed, config.excludeFields, false);
    }
    if (config?.includeFields) {
      transformed = filterFields(transformed, config.includeFields, true);
    }

    // Apply date parsing
    if (config?.dateFields) {
      transformed = this.parseDates(transformed, config.dateFields);
    }

    // Apply boolean parsing
    if (this.options.parseBooleans && config?.booleanFields) {
      transformed = this.parseBooleans(transformed, config.booleanFields);
    }

    // Apply number parsing
    if (this.options.parseNumbers && config?.numberFields) {
      transformed = this.parseNumbers(transformed, config.numberFields);
    }

    return transformed;
  }

  private parseDates(obj: any, dateFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.parseDates(item, dateFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (dateFields.includes(key) && value) {
        result[key] = parseDate(value as string, this.options.dateFormat);
      } else {
        result[key] = this.parseDates(value, dateFields);
      }
    }
    return result;
  }

  private parseBooleans(obj: any, booleanFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.parseBooleans(item, booleanFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (booleanFields.includes(key)) {
        result[key] = convertToBoolean(value);
      } else {
        result[key] = this.parseBooleans(value, booleanFields);
      }
    }
    return result;
  }

  private parseNumbers(obj: any, numberFields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.parseNumbers(item, numberFields));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (numberFields.includes(key)) {
        result[key] = convertToNumber(value);
      } else {
        result[key] = this.parseNumbers(value, numberFields);
      }
    }
    return result;
  }
}

// Default transformers
export const defaultRequestTransformer = new RequestTransformer({
  snakeCase: true,
  dateFormat: 'iso',
  excludeNulls: true,
  excludeUndefined: true,
});

export const defaultResponseTransformer = new ResponseTransformer({
  camelCase: true,
  dateFormat: 'iso',
  parseNumbers: true,
  parseBooleans: true,
});

// Transform configurations for different data types
export const TRANSFORM_CONFIGS = {
  USER: {
    dateFields: ['createdAt', 'updatedAt', 'lastLogin'],
    booleanFields: ['isActive', 'isEmailVerified'],
    excludeFields: ['password', 'refreshToken'],
  },
  INVOICE: {
    dateFields: ['createdAt', 'updatedAt', 'dueDate', 'issueDate'],
    numberFields: ['amount', 'tax', 'total'],
    booleanFields: ['isPaid', 'isSent'],
  },
  ACCOUNT: {
    dateFields: ['createdAt', 'updatedAt'],
    numberFields: ['balance', 'creditLimit'],
    booleanFields: ['isActive'],
  },
  TRANSACTION: {
    dateFields: ['createdAt', 'updatedAt', 'transactionDate'],
    numberFields: ['amount', 'balance'],
    booleanFields: ['isReconciled'],
  },
} as const;

export type TransformConfigType = keyof typeof TRANSFORM_CONFIGS;
