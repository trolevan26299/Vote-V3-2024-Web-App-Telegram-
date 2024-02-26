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
  const checked = useRef<boolean>(false);

  useEffect(() => {
    const storedChecked = localStorage.getItem('checked');

    checked.current = storedChecked ? JSON.parse(storedChecked) : false;
    console.log('checked:', checked.current);
    console.log('userAcess', userAccess);
    console.log('user', user.user);
    if (userAccess && user.user) {
      localStorage.setItem('checked', JSON.stringify(true));
    } else if (checked.current === true) {
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else if (pathname === '/dashboard/vote-dh') {
        router.push(paths.dashboard.voteDH);
      } else if (user.user !== undefined) {
        router.push(paths.dashboard.voteDH);
        // router.push(paths.dashboard.questionAndAnswerPath);
      }
    } else {
      router.replace(paths.auth.jwt.login);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, user, pathname, userAccess]);

  useEffect(() => {
    setUserAccess(telegramContext?.user);
  }, [telegramContext]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
