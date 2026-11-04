import { useQueries } from '@tanstack/react-query';
import useAppStore from '../../store/useAppStore';

// Paths are relative to base_url (".../api/"). If your routes sit inside a
// prefix group on the backend, add the prefix here (e.g. 'analytics/months-current-previous').
export const ENDPOINTS = {
  months: 'months-current-previous',
  responseTime: 'average-response-time',
  requests: 'total-requests',
  residents: 'registered-users',
};

type Num = number | string | null;

export type MonthsCurPrev = {
  current_total: Num;
  previous_total: Num;
  percent_change: Num;
};

export type ResponseTime = {
  current_response: Num;
  previous_response: Num;
  percent_change: Num;
};

export type RequestsTotal = {
  current_month_total: Num;
  previous_month_total: Num;
  monthly_request: Num;
};

export type ResidentsTotal = {
  current_month_registered: Num;
  previous_month_registered: Num;
  monthly_registered: Num;
};

const getJson = async <T>(
  base_url: string,
  token: string,
  path: string,
): Promise<T> => {
  const res = await fetch(`${base_url}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${path} failed (${res.status})`);
  return res.json();
};

const useHomeAnalytics = () => {
  const base_url = useAppStore(state => state.base_url);
  const token = useAppStore(state => state.token);

  const results = useQueries({
    queries: [
      {
        queryKey: ['home-analytics', 'months'],
        queryFn: () => getJson<MonthsCurPrev>(base_url, token, ENDPOINTS.months),
      },
      {
        queryKey: ['home-analytics', 'response-time'],
        queryFn: () =>
          getJson<ResponseTime>(base_url, token, ENDPOINTS.responseTime),
      },
      {
        queryKey: ['home-analytics', 'requests'],
        queryFn: () =>
          getJson<RequestsTotal>(base_url, token, ENDPOINTS.requests),
      },
      {
        queryKey: ['home-analytics', 'residents'],
        queryFn: () =>
          getJson<ResidentsTotal>(base_url, token, ENDPOINTS.residents),
      },
    ],
  });

  const [months, responseTime, requests, residents] = results;

  return {
    months: months.data,
    responseTime: responseTime.data,
    requests: requests.data,
    residents: residents.data,
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
    isRefetching: results.some(r => r.isRefetching),
    refetch: () => Promise.all(results.map(r => r.refetch())),
  };
};

export default useHomeAnalytics;