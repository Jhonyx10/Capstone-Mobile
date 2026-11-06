import { useQuery } from '@tanstack/react-query';
import useAppStore from '../../store/useAppStore';

// Path is relative to base_url (".../api/"). One request returns everything
// the home screen needs, already scoped to the logged-in tanod's group.
export const ENDPOINT = 'tanod/analytics';

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

export type Insights = {
  /** reports filed by the group on each of the last 7 days */
  weekly_trend: { labels: string[]; data: number[] };
  top_categories: { category: string; total: number; percentage: number }[];
  busiest_hour: { hour: number; total: number; label: string } | null;
  response_summary: {
    responses: number;
    fastest: Num;
    slowest: Num;
    average_distance: Num;
  };
  /** unanswered resident requests from the last 24 hours */
  pending_requests: { count: number; oldest_minutes: number | null };
  leaderboard: {
    user_id: number;
    name: string;
    reports: number;
    is_me: boolean;
  }[];
  recent_reports: {
    id: number;
    description: string | null;
    category: string | null;
    zone: string | null;
    created_at: string | null;
  }[];
};

export type HomeAnalytics = {
  reports: MonthsCurPrev;
  response_time: ResponseTime;
  requests: RequestsTotal;
  residents: ResidentsTotal;
} & Insights;

const getHomeAnalytics = async (
  base_url: string,
  token: string,
): Promise<HomeAnalytics> => {
  const res = await fetch(`${base_url}${ENDPOINT}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`${ENDPOINT} failed (${res.status})`);
  const json = await res.json();
  return json.data;
};

const useHomeAnalytics = () => {
  const base_url = useAppStore(state => state.base_url);
  const token = useAppStore(state => state.token);
  // the numbers belong to this tanod's group, so cache them per user
  const userId = useAppStore(state => state.user?.id);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['home-analytics', userId],
    queryFn: () => getHomeAnalytics(base_url, token),
    enabled: !!token,
  });

  // same names HomeScreen already uses, so the screen needs no changes
  return {
    months: data?.reports,
    responseTime: data?.response_time,
    requests: data?.requests,
    residents: data?.residents,
    // everything else on the home screen (charts, lists, alerts)
    insights: data,
    isLoading,
    isError,
    isRefetching,
    refetch,
  };
};

export default useHomeAnalytics;