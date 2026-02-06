import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
	readonly children: ReactNode;
}

interface State {
	readonly hasError: boolean;
	readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('Error caught by boundary:', error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen items-center justify-center px-4">
					<div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-500/5 p-8 text-center">
						<div className="mb-4 text-6xl">💥</div>
						<h1 className="mb-2 text-2xl font-bold text-white">Something went wrong</h1>
						<p className="mb-6 text-sm text-poke-muted">
							{this.state.error?.message || 'An unexpected error occurred'}
						</p>
						<button
							onClick={() => window.location.reload()}
							className="rounded-full bg-poke-red px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-poke-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 focus-visible:ring-offset-poke-bg"
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
