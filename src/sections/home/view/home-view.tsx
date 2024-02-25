'use client';

import { useEffect } from 'react';
import { useUser } from 'src/firebase/user_accesss_provider';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function HomeView() {
  const router = useRouter();
  const { user } = useUser();
  const pathname = usePathname();
  useEffect(() => {
    if (!user) {
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else {
        router.push(paths.dashboard.voteDH);
      }
    } else {
      router.push(paths.dashboard.settingVote.vote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
