import { useState } from 'react';
import { ArrowLeft, CheckCircle, Radio, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { logger } from '../lib/logger';

interface HelpViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export function HelpView({ onBack }: HelpViewProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = encodeURIComponent(`Stash Help & Feedback from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
      );
      window.location.href = `mailto:worksahilsharma@gmail.com?subject=${subject}&body=${body}`;

      setIsSubmitted(true);
      toast.success('Email client opened. Send the email there to complete your message.');

      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      logger.error('Failed to prepare help email:', error);
      toast.error('Failed to open email client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-3xl">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon" className="rounded-full hover:bg-muted/50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-muted-foreground">Support</p>
              <h1 className="text-xl font-semibold tracking-tight">Help & Feedback</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <div className="space-y-6">
          <section className="surface-panel p-5 md:p-7">
            <div className="beta-chip mb-4">
              <Radio className="h-3.5 w-3.5" />
              Private beta support
            </div>
            <h2 className="text-xl font-bold tracking-tight">Frequently asked</h2>
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="font-semibold">How do I save a song?</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Paste or share a music link into Stash. The app identifies the track and saves it to Spotify once access and session state are valid.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">What platforms are supported?</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Stash currently focuses on Instagram, YouTube, and general web links surfaced through the current stash flow.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Why does Spotify access look limited?</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The app is operating as a private beta while staying within Spotify development access limits. That policy is external to Stash and not a bug in your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Why can the backend feel slow after idle time?</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The free Hugging Face backend can wake from sleep after long idle periods. When that happens, the first retry may take a little longer, but the app now surfaces that state more clearly.
                </p>
              </div>
            </div>
          </section>

          <section className="surface-panel p-5 md:p-7">
            <h2 className="text-xl font-bold tracking-tight">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Have a bug report, UX note, or beta-access question? Send it here and your email client will open with the message prefilled.
            </p>

            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Message prepared</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Finish sending it from your email client to reach the team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 rounded-2xl bg-background/50 ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-12 rounded-2xl bg-background/50 ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`rounded-2xl bg-background/50 resize-none ${errors.message ? 'border-destructive' : ''}`}
                  />
                  {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-2xl bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isSubmitting ? 'Preparing...' : <><Send className="mr-2 h-4 w-4" />Send message</>}
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
