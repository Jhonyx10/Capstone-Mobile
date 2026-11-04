// src/util/getOperationDetails.ts
import axios from 'axios';
import { Operation } from '../src/types/OperationType';

interface OperationDetailsParams {
  base_url: string;
  token: string;
  operation_id: number;
}

export const getOperationDetails = async ({
  base_url,
  token,
  operation_id,
}: OperationDetailsParams): Promise<Operation | null> => {
  try {
    const response = await axios.get(`${base_url}operations/${operation_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // The details endpoint returns the operation itself. The fallbacks cover
    // a wrapped response; null (never undefined) keeps React Query happy.
    const body = response.data;
    return body?.operation ?? (body?.id ? body : body?.data ?? null);
  } catch (error) {
    console.log(error);
    throw error;
  }
};