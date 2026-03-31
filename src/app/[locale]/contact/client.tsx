"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Send } from "lucide-react";

interface ContactFormProps {
  dict: {
    form: {
      name: string;
      email: string;
      subject: string;
      message: string;
      placeholder_name: string;
      placeholder_email: string;
      placeholder_message: string;
      submit: string;
      success: string;
      error: string;
    };
    subjects: {
      general: string;
      sales: string;
      support: string;
      partnership: string;
    };
  };
}

export function ContactForm({ dict }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Client-side validation
    if (!formData.name.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (formData.message.trim().length < 10) {
      setStatus("error");
      setErrorMessage("Message must be at least 10 characters long");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          data.error || dict.form.error
        );
        return;
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "general",
        message: "",
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(dict.form.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8"
    >
      {/* Name Field */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
          {dict.form.name}
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={dict.form.placeholder_name}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BEF221] text-gray-900 placeholder-gray-500"
          disabled={status === "loading"}
        />
      </div>

      {/* Email Field */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
          {dict.form.email}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={dict.form.placeholder_email}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BEF221] text-gray-900 placeholder-gray-500"
          disabled={status === "loading"}
        />
      </div>

      {/* Subject Dropdown */}
      <div className="mb-6">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
          {dict.form.subject}
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BEF221] text-gray-900 bg-white"
          disabled={status === "loading"}
        >
          <option value="general">{dict.subjects.general}</option>
          <option value="sales">{dict.subjects.sales}</option>
          <option value="support">{dict.subjects.support}</option>
          <option value="partnership">{dict.subjects.partnership}</option>
        </select>
      </div>

      {/* Message Textarea */}
      <div className="mb-6">
        <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
          {dict.form.message}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={dict.form.placeholder_message}
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BEF221] text-gray-900 placeholder-gray-500 resize-none"
          disabled={status === "loading"}
        />
      </div>

      {/* Error Message */}
      {status === "error" && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {status === "success" && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-700">{dict.form.success}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#BEF221] text-[#0D0630] font-bold py-3 px-6 rounded-lg hover:bg-[#a8d51a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <div className="w-5 h-5 border-2 border-[#0D0630] border-t-transparent rounded-full animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>{dict.form.submit}</span>
          </>
        )}
      </button>
    </form>
  );
}
