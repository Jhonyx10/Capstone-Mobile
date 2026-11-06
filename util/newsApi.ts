import axios from 'axios';

export type NewsItem = {
  id: number;
  category: string | null;
  summary: string | null;
  published_at: string;
};

export type NewsPage = {
  data: NewsItem[];
  current_page: number;
  last_page: number;
};

const log = (...args: any[]) => {
  if (__DEV__) console.log('[NEWS]', ...args);
};

export async function fetchNews({
  base_url,
  token,
  page,
}: {
  base_url: string;
  token: string | null;
  page: number;
}): Promise<NewsPage> {
  const url = `${base_url}news`;

  log('request →', url, { page, hasToken: !!token });

  try {
    const res = await axios.get(url, {
      params: { page },
      timeout: 15000,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });

    log('response ←', res.status, {
      current_page: res.data?.current_page,
      last_page: res.data?.last_page,
      count: res.data?.data?.length,
    });

    // Catches a backend that answers 200 with the wrong shape
    if (!res.data || !Array.isArray(res.data.data)) {
      log('unexpected shape ←', JSON.stringify(res.data)?.slice(0, 500));
      throw new Error('Unexpected response from the server.');
    }

    return res.data;
  } catch (e: any) {
    if (e.response) {
      // The server answered with an error status
      log('HTTP error ←', e.response.status, url);
      log('body ←', JSON.stringify(e.response.data)?.slice(0, 800));
    } else if (e.request) {
      // The request went out but nothing came back
      log('NO RESPONSE (network / wrong host / timeout):', e.code, e.message, url);
    } else {
      log('error:', e.message);
    }
    throw e;
  }
}