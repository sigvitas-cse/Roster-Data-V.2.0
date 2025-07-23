import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Simulate submission delay
    setTimeout(() => {
      alert('Message submitted! Thank you.');
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-6 px-6 md:px-10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-700">Contact Triangle IP</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Contact Info */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-sky-800">We'd Love to Hear From You</h2>
            <p className="text-gray-700">
              Whether you have questions about our platform, need support, or just want to say hi —
              our team is ready to assist.
            </p>

            <div className="space-y-4 text-gray-700 text-sm">
              <div>
                <p className="font-semibold text-sky-700">📍 Address</p>
                <p>123 Innovation Lane, Palo Alto, CA, 94301</p>
              </div>
              <div>
                <p className="font-semibold text-sky-700">📧 Email</p>
                <p>support@triangleip.com</p>
              </div>
              <div>
                <p className="font-semibold text-sky-700">📞 Phone</p>
                <p>+1 (800) 123-4567</p>
              </div>
            </div>

           <img
              src="https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Contact Support Team"
              className="rounded-xl shadow-md w-full mt-6 object-cover"
            />


          </div>

          {/* Right: Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-semibold text-sky-700 mb-6">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Your Message</label>
                <textarea
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitted ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
