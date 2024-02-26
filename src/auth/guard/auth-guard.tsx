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

    if (checked.current && userAccess && user.user) {
      // Nếu đã được kiểm tra và người dùng hợp lệ, điều hướng đến router phù hợp
      if (pathname === '/dashboard/question-and-answer') {
        router.push(paths.dashboard.questionAndAnswerPath);
      } else if (pathname === '/dashboard/vote-dh') {
        router.push(paths.dashboard.voteDH);
      } else {
        router.push(paths.dashboard.voteDH);
      }
    } else {
      // Nếu chưa được kiểm tra hoặc người dùng không hợp lệ, chuyển hướng đến trang login
      router.replace(paths.auth.jwt.login);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked.current, userAccess, user.user, pathname]);

  useEffect(() => {
    const storedChecked = localStorage.getItem('checked');
    checked.current = storedChecked ? JSON.parse(storedChecked) : false;
  }, []);

  useEffect(() => {
    setUserAccess(telegramContext?.user);
  }, [telegramContext]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
