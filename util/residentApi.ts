import axios from 'axios';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

function toApiError(e: any): ApiError {
  if (!e.response) {
    return new ApiError(0, 'Walang koneksyon sa server. Subukan ulit.');
  }
  const { status, data } = e.response;
  const firstError = data?.errors
    ? (Object.values(data.errors)[0] as string[])[0]
    : undefined;
  return new ApiError(status, firstError ?? data?.message ?? 'Something went wrong.', data?.code);
}

// Adjust the paths if your base_url already ends with /api
export async function residentLogin(base_url: string, phone: string, secret: string | null) {
  try {
    const { data } = await axios.post(
      `${base_url}resident-login`,
      { phone, secret },
      { headers: { Accept: 'application/json' } },
    );
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export async function residentRegister(base_url: string, form: FormData) {
  try {
    const { data } = await axios.post(`${base_url}register`, form, {
      headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}