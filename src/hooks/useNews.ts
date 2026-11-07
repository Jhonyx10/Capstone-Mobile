import { useInfiniteQuery } from '@tanstack/react-query';
import useAppStore from '../../store/useAppStore';
import { fetchNews } from '../../util/newsApi';

const useNews = () => {
  const base_url = useAppStore(s => s.base_url);
  const token = useAppStore(s => s.token);

  return useInfiniteQuery({
    queryKey: ['news'],
    queryFn: ({ pageParam }) => fetchNews({ base_url, token, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
    retry: 1, // default is 3, which keeps the spinner up for a long time
  });
};

export default useNews;