import { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface HelpViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export function HelpView({ onBack, theme }: HelpViewProps) {
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
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
      // Create mailto link with form data
      const subject = encodeURIComponent(`Stash Help & Feedback from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:worksahilsharma@gmail.com?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success state
      setIsSubmitted(true);
      toast.success('Email client opened! Send the email to complete your message.');
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to open email client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white noise-texture">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 style={{ fontWeight: 600 }}>Help & Feedback</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-24 max-w-2xl">
        <div className="space-y-8">
          {/* FAQ Section */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-6" style={{ fontWeight: 600 }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>How do I save a song?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Simply paste any music link (YouTube, TikTok, Instagram, etc.) into the input field and click Stash. We'll find the song and add it to your Spotify library!
                </p>
              </div>
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>What platforms are supported?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stash works with YouTube, TikTok, Instagram, Twitter, and most websites that feature music content.
                </p>
              </div>
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>Can I customize my settings?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! Visit the Settings page to enable auto-add mode, choose a default playlist, and toggle between light and dark themes.
                </p>
              </div>
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>Is my data secure?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Absolutely. We only access your Spotify account information necessary to save songs. Check our Privacy Policy for more details.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="glass-card rounded-2xl p-8 shadow-lg">
            <h2 className="mb-2" style={{ fontWeight: 600 }}>Send Us a Message</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Have a question or feedback? We'd love to hear from you!
            </p>

            {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#1DB954]/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#1DB954]" />
                </div>
                <h3 style={{ fontWeight: 600 }}>Message Sent!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete sending the email in your email client to reach us.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm" style={{ fontWeight: 500 }}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`glass-light border-gray-200 dark:border-white/20 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm" style={{ fontWeight: 500 }}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`glass-light border-gray-200 dark:border-white/20 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-sm" style={{ fontWeight: 500 }}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`glass-light border-gray-200 dark:border-white/20 resize-none ${
                      errors.message ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black"
                  style={{ fontWeight: 600 }}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </section>

          {/* Direct Contact */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-500">
            Or email us directly at{' '}
            <a href="mailto:worksahilsharma@gmail.com" className="text-[#1DB954] hover:underline">
              worksahilsharma@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
