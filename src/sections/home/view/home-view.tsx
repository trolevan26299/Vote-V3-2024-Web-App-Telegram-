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

  useEffect(() => {
    const setInit = async () => {
      await setUserAccess(telegramContext?.user?.id);
    };
    setInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramContext]);
  useEffect(() => {
    const checkRole = () => {
      console.log('userAccess', userAccess);
      console.log('user:', user);
      // Chỉ thực hiện kiểm tra khi cả userAccess và user đã được định nghĩa
      if (userAccess !== undefined && user !== undefined) {
        router.push(paths.dashboard.voteDH);
      } else if (userAccess !== undefined) {
        // Nếu chỉ userAccess được định nghĩa, nhưng user chưa được, chuyển đến trang 404
        router.push(paths.page404);
      } else {
        // Nếu cả userAccess và user đều chưa được định nghĩa, chuyển đến trang đặt cấu hình vote
        router.push(paths.dashboard.settingVote.vote);
      }
    };

    checkRole();
  }, [userAccess, user, router]);
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
}
