'use client';

import { useEffect, useState } from 'react';
import { useUser } from 'src/firebase/user_accesss_provider';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';

export default function HomeView() {
  const router = useRouter();
  const { user } = useUser();
  const [userAccess, setUserAccess] = useState<any>();
  const pathname = usePathname();
  const telegramContext = useTelegram();

  useEffect(() => {
    if (userAccess) {
      if (user) {
        if (pathname === '/dashboard/question-and-answer') {
          router.push(paths.dashboard.questionAndAnswerPath);
        } else if ('/dashboard/vote-dh') {
          router.push(paths.dashboard.voteDH);
        }
      } else {
        router.push(paths.page403);
      }
    } else {
      router.push(paths.dashboard.settingVote.vote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserAccess(telegramContext?.user);
  }, [telegramContext]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
