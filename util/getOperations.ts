import axios from 'axios';
import type { OperationsPage } from '../src/types/OperationType';

interface OperationsParams {
  base_url: string;
  token: string;
  page?: number;
}

export const getOperations = async ({
  base_url,
  token,
  page = 1,
}: OperationsParams): Promise<OperationsPage> => {
  try {
    const response = await axios.get(`${base_url}operations`, {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};