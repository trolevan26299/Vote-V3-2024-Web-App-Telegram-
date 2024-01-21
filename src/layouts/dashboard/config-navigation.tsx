import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components

import SvgColor from 'src/components/svg-color';

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

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: '',
        items: [
          {
            title: 'Trang chủ',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          // {
          //   title: 'Tiến trình bầu cử',
          //   path: paths.dashboard.process.dh,
          //   icon: ICONS.ecommerce,
          //   children: [
          //     { title: 'Bỏ phiếu đại hội', path: paths.dashboard.process.dh },
          //     {
          //       title: 'Bầu cử hội đồng',
          //       path: paths.dashboard.process.hd,
          //     },
          //   ],
          // },
          {
            title: 'Tiến trình bỏ phiếu',
            path: paths.dashboard.process.dh,
            icon: ICONS.ecommerce,
            // children: [],
          },
          {
            title: 'Bỏ phiếu đại hội',
            path: paths.dashboard.voteDH,
            icon: ICONS.analytics,
          },
          // {
          //   title: 'Bầu cử hội đồng',
          //   path: paths.dashboard.voteHD,
          //   icon: ICONS.banking,
          // },
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  return data;
}
