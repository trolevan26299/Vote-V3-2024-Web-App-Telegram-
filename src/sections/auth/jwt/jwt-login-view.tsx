'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { useRouter } from 'src/routes/hooks';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { get, ref } from 'firebase/database';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';

// ----------------------------------------------------------------------

interface IAccountManager {
  user_name: string;
  password: string;
}

export default function JwtLoginView() {
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const [accountManager, setAccountManager] = useState<IAccountManager[]>([]);

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    userName: Yup.string().required('UserName is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    userName: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const checkLogin =
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (
        accountManager.find((item) => item.user_name === data.userName) &&
        accountManager.find((item) => item.password === data.password)
      ) {
        localStorage.setItem('checked', JSON.stringify(true));
        router.push(PATH_AFTER_LOGIN);
      } else {
        reset();
        setErrorMsg('Invalid UserName or password');
      }
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.ACCOUNT_MANAGER);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setAccountManager(snapshot.val());
        } else {
          console.log('NO DATA');
        }
      } catch (error) {
        console.error('ERROR:', error);
      }
    };
    fetchData();
  }, []);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, mt: 10 }}>
      <Typography variant="h4">Sign in to V3 Vote</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="userName" label="User Name" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
