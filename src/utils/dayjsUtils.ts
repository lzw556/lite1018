import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(timezone);

export type RangeValue = [dayjs.Dayjs, dayjs.Dayjs];

export default dayjs;

export type Dayjs = dayjs.Dayjs;
