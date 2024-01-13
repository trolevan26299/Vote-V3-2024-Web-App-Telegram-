// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

// export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const HOST_API = 'https://api-dev-minimal-v510.vercel.app';
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
