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
  }, []);

  useEffect(() => {
    if (userAccess && user.user) {
      if (checked.current === true) {
        if (pathname === '/dashboard/question-and-answer') {
          router.push(paths.dashboard.questionAndAnswerPath);
        } else if (pathname === '/dashboard/vote-dh') {
          router.push(paths.dashboard.voteDH);
        } else if (user.user !== undefined) {
          router.push(paths.dashboard.voteDH);
        }
      } else {
        router.replace(paths.auth.jwt.login);
      }
      // Lưu trạng thái checked vào localStorage trước khi kiểm tra điều kiện
      localStorage.setItem('checked', JSON.stringify(true));
    } else if (userAccess === undefined && checked.current === true) {
      router.replace(paths.dashboard.settingVote.vote);
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
