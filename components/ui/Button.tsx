import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  onClick?: () => void;
  href?: string; // renders a next/link instead of a <button>
  pressed?: boolean; // for toggle-style buttons such as filter tabs
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const variants = {
  primary:
    'border-brand-primary bg-brand-primary text-white hover:border-brand-accent hover:bg-brand-accent dark:hover:border-brand-light dark:hover:bg-brand-light dark:hover:text-zinc-900',
  outline:
    'border-brand-primary/40 bg-transparent text-brand-accent hover:border-brand-primary hover:bg-brand-primary hover:text-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-brand-primary',
};

export default function Button({
  children,
  variant = 'primary',
  onClick,
  href,
  pressed,
  className = '',
  type = 'button',
  disabled,
}: ButtonProps) {
  const styles = `disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-pressed={pressed} className={styles}>
      {children}
    </button>
  );
}
