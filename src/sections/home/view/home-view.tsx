'use client';

import { useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
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
    if (user) {
      router.push(paths.dashboard.voteDH);
    } else {
      router.push(paths.dashboard.settingVote.vote);
    }
  };

  useEffect(() => {
    const setInit = async () => {
      // Fetch data and set userAccess
      await setUserAccess(telegramContext?.user?.id);
      checkRole(); // Check role after setting userAccess
    };
    setInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramContext]);

  // Display loading spinner or other UI while fetching data
  if (userAccess === undefined) {
    return <LoadingScreen />;
  }

  // Your other JSX components go here

  return <></>; // Empty fragment
}
