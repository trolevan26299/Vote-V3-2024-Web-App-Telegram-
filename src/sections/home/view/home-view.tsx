'use client';

import { useEffect } from 'react';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function HomeView() {
  const router = useRouter();
  const { user } = useUser();
  useEffect(() => {
    if (!user) {
      router.push(paths.dashboard.root);
    } else {
      router.push(paths.dashboard.settingVote.vote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
