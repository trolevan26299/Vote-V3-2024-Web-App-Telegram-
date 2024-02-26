import { useEffect, useState } from 'react';
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
  const [checked, setChecked] = useState<boolean>(false);
  const [userTele, setUserTele] = useState<boolean>(false);
  const [userCD, setUserCD] = useState<boolean>(false);

  useEffect(() => {
    const getLocal = async () => {
      const storedChecked = await localStorage.getItem('checked');
      const isChecked = !!storedChecked;
      setChecked(isChecked);
      if (!isChecked) {
        router.replace(paths.auth.jwt.login);
      }
    };
    getLocal();
  }, [router]);

  useEffect(() => {
    setUserTele(!!telegramContext?.user);
  }, [telegramContext]);

  useEffect(() => {
    setUserCD(!!user.user);
  }, [user]);

  useEffect(() => {
    if (userTele && userCD) {
      localStorage.setItem('checked', JSON.stringify(true));
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else if (pathname === '/dashboard/vote-dh') {
        router.push(paths.dashboard.voteDH);
      } else {
        router.replace(PATH_AFTER_LOGIN);
      }
    }
  }, [userCD, userTele, pathname, router]);

  return <>{children}</>;
}
