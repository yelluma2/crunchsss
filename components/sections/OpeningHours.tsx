'use client';
import { useEffect, useState } from 'react';
import type { DayHours } from '@/data/hours';

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function OpeningHours({
  hours,
  title = 'Opening Hours',
}: {
  hours: DayHours[];
  title?: string;
}) {
  // today is read after mount so server and client HTML always match
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  }, []);

  return (
    <div>
      <h2 className="text-center text-3xl font-semibold text-brand-accent dark:text-brand-light">
        {title}
      </h2>
      <ul className="mt-6 divide-y divide-brand-primary/15 dark:divide-zinc-800">
        {hours.map((d) => (
          <li
            key={d.day}
            className={`flex justify-between px-3 py-2.5 text-sm ${
              d.day === today ? 'rounded bg-brand-secondary font-semibold dark:bg-zinc-800' : ''
            }`}
          >
            <span>{d.day}</span>
            {d.closed ? (
              <span className="font-medium text-rose-700 dark:text-rose-400">Closed</span>
            ) : (
              <span className="text-zinc-600 dark:text-zinc-300">
                {formatTime(d.open)} – {formatTime(d.close)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
