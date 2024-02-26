import { useEffect, useRef, useState } from 'react';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useUser } from 'src/firebase/user_accesss_provider';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';
import { usePathname, useRouter } from '../../routes/hooks/index';

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const telegramContext = useTelegram();
  const user = useUser();
  const pathname = usePathname();
  const [userAccess, setUserAccess] = useState<any>();
  const [userCD, setUserCD] = useState<any>();
  const checked = useRef<boolean>(false);

  useEffect(() => {
    // const storedChecked = localStorage.getItem('checked');

    // checked.current = storedChecked ? JSON.parse(storedChecked) : false;
    if (userAccess && userCD && !checked.current) {
      localStorage.setItem('checked', JSON.stringify(true));
    } else if (checked.current === true) {
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else if (pathname === '/dashboard/vote-dh') {
        router.push(paths.dashboard.voteDH);
      } else if (userCD !== undefined) {
        router.push(paths.dashboard.voteDH);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, userCD, pathname, userAccess]);
  useEffect(() => {
    const storedChecked = localStorage.getItem('checked');
    checked.current = storedChecked ? JSON.parse(storedChecked) : false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUserAccess(telegramContext?.user);
    setUserCD(user.user)
  }, [telegramContext,user]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
