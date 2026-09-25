export const successResponse = (data: any, message = 'Success') => {
  return { success: true, message, data };
};

export const listResponse = (data: any[], pagination: any) => {
  return { success: true, data, pagination };
};

export const errorResponse = (message: string, code?: string, statusCode?: number) => {
  return { success: false, message, code, statusCode };
};
