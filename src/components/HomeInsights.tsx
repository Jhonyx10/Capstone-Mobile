import { View, Text } from 'react-native';
import Enter from './Enter';
import Icon from './Icon';
import BarChartComponent from './BarChartComponent';
import type { Insights } from '../hooks/useHomeAnalytics';

const num = (v: unknown) => Number(v ?? 0) || 0;

const minutesLabel = (m: number) => {
  if (m < 1) return 'less than a minute';
  if (m < 60) return `${Math.round(m)} min`;
  const h = Math.floor(m / 60);
  const rest = Math.round(m % 60);
  return rest ? `${h} h ${rest} min` : `${h} h`;
};

const timeAgo = (iso: string | null) => {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0) return '';
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

const Card = ({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) => (
  <Enter
    index={index}
    className="mt-4 rounded-xl border-l-4 border-lime-600 bg-white p-4 dark:bg-slate-800"
  >
    <Text className="mb-3 text-[15px] font-bold text-gray-800 dark:text-white">
      {title}
    </Text>
    {children}
  </Enter>
);

const MiniCard = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) => (
  <View className="flex-1 rounded-xl border-l-4 border-lime-600 bg-white p-3 dark:bg-slate-800">
    <Text className="text-[11px] text-gray-500 dark:text-gray-400">
      {title}
    </Text>
    <Text className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
      {value}
    </Text>
    <Text className="mt-0.5 text-[11px] text-lime-600">{sub}</Text>
  </View>
);

const HomeInsights = ({ insights }: { insights?: Insights }) => {
  if (!insights) return null;

  const {
    weekly_trend,
    top_categories,
    busiest_hour,
    response_summary,
    pending_requests,
    leaderboard,
    recent_reports,
  } = insights;

  const weekTotal = weekly_trend.data.reduce((a, b) => a + b, 0);

  return (
    <View>
      {/* unanswered requests: the one thing that needs action now */}
      {pending_requests.count > 0 && (
        <Enter
          index={5}
          className="mt-4 flex-row items-center rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20"
        >
          <Icon name="alert-triangle" color="#F59E0B" size={22} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {pending_requests.count}{' '}
              {pending_requests.count === 1 ? 'request is' : 'requests are'}{' '}
              waiting for a responder
            </Text>
            {pending_requests.oldest_minutes !== null && (
              <Text className="text-xs text-amber-700 dark:text-amber-400">
                Oldest has waited{' '}
                {minutesLabel(pending_requests.oldest_minutes)}
              </Text>
            )}
          </View>
        </Enter>
      )}

      {/* quick facts */}
      <Enter index={6} className="mt-4 flex-row gap-2">
        <MiniCard
          title="Busiest hour"
          value={busiest_hour ? busiest_hour.label : '—'}
          sub={
            busiest_hour
              ? `${busiest_hour.total} reports, last 90 days`
              : 'No reports yet'
          }
        />
        <MiniCard
          title="Fastest response"
          value={
            response_summary.fastest === null
              ? '—'
              : `${num(response_summary.fastest).toFixed(1)} min`
          }
          sub={
            response_summary.responses
              ? `${response_summary.responses} responses this month`
              : 'No responses yet'
          }
        />
      </Enter>

      {/* last 7 days */}
      <Enter index={7}>
        <BarChartComponent
          title={`Your group, last 7 days (${weekTotal} reports)`}
          labels={weekly_trend.labels}
          data={weekly_trend.data}
        />
      </Enter>

      {/* categories */}
      {top_categories.length > 0 && (
        <Card title="Top incident types this month" index={8}>
          {top_categories.map(c => (
            <View key={c.category} className="mb-3">
              <View className="mb-1 flex-row justify-between">
                <Text className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                  {c.category}
                </Text>
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  {c.total}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
                <View
                  className="h-2 rounded-full bg-[#5D8736]"
                  style={{ width: `${Math.max(c.percentage, 4)}%` }}
                />
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* group leaderboard, only when there is a group to compare */}
      {leaderboard.length > 1 && (
        <Card title="Group activity this month" index={9}>
          {leaderboard.map((m, i) => (
            <View
              key={m.user_id}
              className={`mb-2 flex-row items-center rounded-lg px-3 py-2 ${
                m.is_me
                  ? 'bg-[#5D8736]/10 dark:bg-[#5D8736]/25'
                  : 'bg-gray-50 dark:bg-slate-700/50'
              }`}
            >
              <Text className="w-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                {i + 1}
              </Text>
              <Text
                numberOfLines={1}
                className="flex-1 text-sm text-gray-800 dark:text-white"
              >
                {m.name}
                {m.is_me ? ' (you)' : ''}
              </Text>
              <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                {m.reports} {m.reports === 1 ? 'report' : 'reports'}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* latest reports */}
      {recent_reports.length > 0 && (
        <Card title="Latest reports from your group" index={10}>
          {recent_reports.map(r => (
            <View
              key={r.id}
              className="mb-3 border-b border-gray-100 pb-3 dark:border-slate-700"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                  Report #{r.id}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(r.created_at)}
                </Text>
              </View>
              <Text className="mt-0.5 text-xs text-lime-700 dark:text-lime-400">
                {[r.category, r.zone].filter(Boolean).join(', ')}
              </Text>
              {r.description ? (
                <Text
                  numberOfLines={2}
                  className="mt-1 text-sm text-gray-600 dark:text-gray-300"
                >
                  {r.description}
                </Text>
              ) : null}
            </View>
          ))}
        </Card>
      )}
    </View>
  );
};

export default HomeInsights;
