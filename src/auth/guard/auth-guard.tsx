import { useEffect, useState } from 'react';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';
import { useRouter } from '../../routes/hooks/index';

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const userAccess = useTelegram();

  useEffect(() => {
    console.log('userAccess:', userAccess?.user?.id);
    if (userAccess?.user?.id) {
      setChecked(true);
    } else {
      router.replace(paths.auth.jwt.login);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
