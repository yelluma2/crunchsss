export interface DayHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export const openingHours: DayHours[] = [
  { day: 'Monday', open: '11:00', close: '22:00' },
  { day: 'Tuesday', open: '11:00', close: '22:00' },
  { day: 'Wednesday', open: '11:00', close: '22:00' },
  { day: 'Thursday', open: '11:00', close: '22:30' },
  { day: 'Friday', open: '11:00', close: '23:00' },
  { day: 'Saturday', open: '10:00', close: '23:00' },
  { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
];
