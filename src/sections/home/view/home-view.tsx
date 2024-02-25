'use client';

import { useEffect, useState } from 'react';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';

export default function HomeView() {
  const router = useRouter();
  const telegramContext = useTelegram();
  const { user } = useUser();
  const [userAccess, setUserAccess] = useState<number | undefined>(undefined);

  const checkRole = () => {
    console.log('userAccess', userAccess);
    console.log('user:', user);

    if (user) {
      router.push(paths.dashboard.voteDH);
    } else {
      router.push(paths.page404);
    }
  };

  useEffect(() => {
    const setInit = async () => {
      await setUserAccess(telegramContext?.user?.id);
      if (telegramContext?.user?.id !== undefined) {
        checkRole();
      } else {
        router.push(paths.page404);
      }
    };
    setInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramContext]);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
