import { useEffect, useRef } from 'react';
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
  const userAccess = useTelegram();
  const user = useUser();
  const pathname = usePathname();

  const checked = useRef<boolean>(false);

  useEffect(() => {
    const storedChecked = localStorage.getItem('checked');

    checked.current = storedChecked ? JSON.parse(storedChecked) : false;

    if (userAccess) {
      localStorage.setItem('checked', JSON.stringify(true));
    } else if (checked.current === true) {
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else {
        router.push(PATH_AFTER_LOGIN);
      }
    } else {
      router.replace(paths.auth.jwt.login);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, user, pathname]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
