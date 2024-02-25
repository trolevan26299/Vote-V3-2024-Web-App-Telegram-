/* eslint-disable react-hooks/exhaustive-deps */

'use client';

// UserProvider.js
import { get, ref } from 'firebase/database';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { useTelegram } from 'src/telegram/telegram.provider';
import { IUserAccess } from 'src/types/userAccess.types';
import { database } from './firebase.config';

interface IUserContext {
  user?: IUserAccess;
}

export const UserContext = createContext<IUserContext>({});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUserAccess>();
  const [userAccess, setUserAccess] = useState<number | undefined>(0);
  console.log('userAccess', userAccess);
  const telegramContext = useTelegram();
  useEffect(() => {
    setUserAccess(telegramContext?.user?.id);
  }, [telegramContext]);

  useEffect(() => {
    // const idTelegram = 6359530967; // Đặt giá trị idTelegram tùy theo nhu cầu của bạn
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);
    if (!userAccess) return;
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          // Lặp qua từng đối tượng trong collection
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data && String(data.telegram_id) === String(userAccess)) {
              setUser(data);
              console.log(data);
            }
          });
          console.groupEnd();
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data :', error);
      }
    };

    fetchData();
  }, [userAccess]);
  // }, []);

  const value = useMemo(() => ({ user }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line arrow-body-style
export const useUser = () => {
  return useContext(UserContext);
};
