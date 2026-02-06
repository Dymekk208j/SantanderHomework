import type { ReactNode } from 'react';

export interface MessageBoxProps {
	readonly icon: string;
	readonly text: string;
	readonly variant: 'loading' | 'error' | 'empty';
	readonly extra?: ReactNode;
	readonly action?: ReactNode;
}
