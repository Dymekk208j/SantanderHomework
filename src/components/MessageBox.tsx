import type { FC } from 'react';
import type { MessageBoxProps } from '@app-types';

export const MessageBox: FC<MessageBoxProps> = ({ icon, text, variant, extra, action }) => {
	const variantStyles = {
		loading: 'bg-poke-surface border-white/[0.06] text-poke-secondary',
		error: 'bg-red-500/5 border-red-400/20 text-red-400',
		empty: 'bg-poke-surface border-white/[0.06] text-poke-muted',
	} as const;

	return (
		<div
			className={`rounded-[14px] border px-5 py-6 text-center ${variantStyles[variant]}`}
			role={variant === 'error' ? 'alert' : undefined}
			aria-live={variant !== 'error' ? 'polite' : undefined}
		>
			{extra}
			{icon && <span className="mb-2 block text-2xl">{icon}</span>}
			<span className={`text-sm font-medium ${action ? 'mb-3 block' : ''}`}>{text}</span>
			{action}
		</div>
	);
};
