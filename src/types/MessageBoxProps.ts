import type { ReactNode } from 'react';
import type { MessageBoxVariant } from './MessageBoxVariant';

export interface MessageBoxProps {
	readonly icon: string;
	readonly text: string;
	readonly variant: MessageBoxVariant;
	readonly extra?: ReactNode;
	readonly action?: ReactNode;
}
