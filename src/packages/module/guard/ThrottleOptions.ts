import { DateUtil } from '@ts-core/common';

// 30 requests from the same IP can be made to a single endpoint in 10 seconds.
export const THROTTLE_TTL_DEFAULT = 10 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_LIMIT_DEFAULT = 30;

// 20 requests from the same IP can be made to a single endpoint in 5 seconds.
export const THROTTLE_TTL_FAST = 5 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_LIMIT_FAST = 20;

// 4 requests from the same IP can be made to a single endpoint in 5 seconds.
export const THROTTLE_TTL_SLOW = 5 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_LIMIT_SLOW = 4;

