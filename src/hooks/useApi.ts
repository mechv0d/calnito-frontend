import { useMemo } from 'react';

import { ApiClient } from '../api/client';
import { useAuth } from '../app/providers/AuthProvider';

export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => new ApiClient(getToken), [getToken]);
}
