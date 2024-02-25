/* eslint-disable no-nested-ternary */
import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components

import SvgColor from 'src/components/svg-color';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useTelegram } from 'src/telegram/telegram.provider';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { user } = useUser();
  const telegramContext = useTelegram();
  console.log('user menu:', user);

  const data = useMemo(() => {
    const adminMenu = [
      {
        subheader: '',
        items: [
          {
            title: 'Tiến trình bỏ phiếu',
            path: paths.dashboard.process.dh,
            icon: ICONS.ecommerce,
            // children: [],
          },
          {
            title: 'Quản Lý',
            icon: ICONS.booking,
            path: paths.dashboard.settingVote.vote,
            children: [
              { title: 'Cài đặt bỏ phiếu', path: paths.dashboard.settingVote.vote },
              // {
              //   title: 'Cài đặt bầu cử',
              //   path: paths.dashboard.settingVote.election,
              // },
              {
                title: 'Thông tin cổ đông',
                path: paths.dashboard.settingVote.info,
              },
            ],
          },
        ],
      },
    ];

    const userMenu = [
      {
        subheader: '',
        items: [
          {
            title: user?.nguoi_nuoc_ngoai === true ? 'Dashboard' : 'Dashboard thông tin',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          {
            title:
              user?.nguoi_nuoc_ngoai === true
                ? 'Congress Poll Process'
                : 'Tiến trình bỏ phiếu đại hội',
            path: paths.dashboard.process.dh,
            icon: ICONS.ecommerce,
            // children: [],
          },
          {
            title: user?.nguoi_nuoc_ngoai === true ? 'Congress Poll' : 'Bỏ phiếu đại hội',
            path: paths.dashboard.voteDH,
            icon: ICONS.analytics,
          },
        ],
      },
    ];

    // return user ? [...userMenu] : [...adminMenu];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return telegramContext?.user?.id ? (user ? [...userMenu] : []) : [...adminMenu];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  return data;
}
