'use client';

import { useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function HomeView() {
  const router = useRouter();
  useEffect(() => {
    router.push(paths.dashboard.root);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
