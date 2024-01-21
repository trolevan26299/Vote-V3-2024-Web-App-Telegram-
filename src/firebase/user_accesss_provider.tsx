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
  const userAccess = useTelegram();
  console.log('userAccess:', userAccess?.user?.id);

  useEffect(() => {
    // const idTelegram = 6359530967; // Đặt giá trị idTelegram tùy theo nhu cầu của bạn
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          console.group('Thông tin cổ đông :');
          // Lặp qua từng đối tượng trong collection
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            // Kiểm tra nếu trường "telegram_id" bằng với idTelegram
            if (data && data.telegram_id === userAccess?.user?.id) {
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
  }, []);

  const value = useMemo(() => ({ user }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line arrow-body-style
export const useUser = () => {
  return useContext(UserContext);
};
