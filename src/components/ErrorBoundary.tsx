import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background px-4 py-10 text-foreground">
                    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
                        <div className="surface-panel w-full p-8 text-center md:p-10">
                            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[1.5rem] border border-destructive/20 bg-destructive/10 text-destructive">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                Recovery Mode
                            </p>
                            <h1 className="mb-3 text-3xl font-bold tracking-tight">
                                Stash hit an unexpected issue
                            </h1>
                            <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                                The app ran into a render problem. A refresh usually clears it and brings you back to your library or the current stash flow.
                            </p>
                            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="rounded-full bg-primary px-6 text-primary-foreground hover:opacity-90"
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Refresh page
                                </Button>
                                <Button
                                    onClick={() => this.setState({ hasError: false, error: undefined })}
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    Try recovery
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
