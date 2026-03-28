"use client";

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  Clock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Thank you! Your message has been sent successfully. We will get back to you shortly.");
        e.currentTarget.reset();
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      alert("We're sorry, there was an error sending your message. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            Let’s <span className="text-[#008cff]">Connect</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Have questions about admissions or need help with the platform? Our team is here to support your educational journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Contact Information & WhatsApp */}
          <div className="space-y-8">
            <div className="bg-[#008cff] rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <ContactDetail 
                  icon={<Phone className="w-5 h-5" />} 
                  title="Call Us" 
                  value="+92 3441284568" 
                />
                <ContactDetail 
                  icon={<Mail className="w-5 h-5" />} 
                  title="Email" 
                  value="dakhla.world@gmail.com" 
                />
                <ContactDetail 
                  icon={<MapPin className="w-5 h-5" />} 
                  title="Location" 
                  value="Karachi, Pakistan" 
                />
                <ContactDetail 
                  icon={<Clock className="w-5 h-5" />} 
                  title="Support Hours" 
                  value="Mon - Fri: 9:00 AM - 6:00 PM" 
                />
              </div>

              <div className="mt-12 pt-8 border-t border-blue-400/50 flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-all">
                    <Globe className="w-5 h-5" />
                 </div>
              </div>
            </div>

            {/* WhatsApp Card Integration */}
            <div className="p-6 bg-white dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-[#008cff] rounded-full flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#008cff] dark:text-[#008cff]">Quick Response?</h3>
                  <p className="text-sm text-[#008cff] dark:text-[#008cff]">Chat with our support team on WhatsApp.</p>
                </div>
              </div>
              <a 
                href="https://wa.me/923390090529" 
                target="_blank"
                className="inline-flex items-center justify-center w-full bg-[#008cff] hover:bg-[#0066cc] text-white font-bold py-3 px-6 rounded-xl transition-colors gap-2"
              >
                Start Chatting Now
              </a>
            </div>

          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input name="name" placeholder="John Doe" className="rounded-xl border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input name="email" type="email" placeholder="john@example.com" className="rounded-xl border-slate-200" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input name="subject" placeholder="How can we help?" className="rounded-xl border-slate-200" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Message</label>
                <Textarea 
                  name="message"
                  placeholder="Tell us more about your inquiry..." 
                  className="min-h-[150px] rounded-xl border-slate-200" 
                  required 
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#008cff] hover:bg-[#0066cc] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-[#008cff]" />
                Response Time
              </h3>
              <p className="text-sm text-slate-500">
                We typically respond to all inquiries within 24-48 business hours. For urgent admission deadlines, please mention "Urgent" in the subject.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactDetail({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}