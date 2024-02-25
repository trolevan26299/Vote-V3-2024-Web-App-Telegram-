'use client';

import { useEffect } from 'react';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';

export default function HomeView() {
  const router = useRouter();
  const telegramContext = useTelegram();
  const { user } = useUser();

  useEffect(() => {
    if (telegramContext?.user?.id) {
      if (user) {
        router.push(paths.dashboard.voteDH);
      } else {
        router.push(paths.dashboard.permission);
      }
    } else {
      router.push(paths.dashboard.settingVote.vote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramContext]);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
