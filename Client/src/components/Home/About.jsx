import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-6 px-6 md:px-10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-700">About Triangle IP</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="relative text-center py-20 bg-sky-100">
        <h2 className="text-5xl font-bold text-sky-800 mb-4">Simplifying Innovation, One Patent at a Time</h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          At Triangle IP, we're on a mission to revolutionize how ideas turn into powerful IP assets.
        </p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-sky-500 rounded-full mt-6"></div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-20 space-y-24">

        {/* Journey Timeline */}
        <section className="space-y-10">
          <h3 className="text-3xl font-bold text-center text-sky-800 mb-8">Our Journey</h3>
          <div className="relative border-l-4 border-sky-200 pl-6 space-y-8">
            <div>
              <h4 className="text-xl font-semibold text-sky-700">🚀 Founded to Fix Broken Patent Systems</h4>
              <p className="text-gray-700">
                Created by IP professionals and engineers who experienced firsthand how clunky and slow traditional patent workflows were.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-sky-700">💡 Innovation Platform Takes Shape</h4>
              <p className="text-gray-700">
                We built tools that streamline disclosures, align stakeholders, and offer insights that matter.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-sky-700">🌎 Serving Global Teams</h4>
              <p className="text-gray-700">
                From startups to enterprises, our platform helps protect IP in over 30+ countries.
              </p>
            </div>
          </div>
        </section>

        {/* Visual Engagement */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold text-sky-700">Why It Matters</h3>
            <p className="text-gray-700 leading-relaxed">
              Great ideas deserve great protection. Our platform turns your innovation into competitive advantage by helping you move fast, stay informed, and reduce friction.
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Easy-to-use invention disclosure system</li>
              <li>Real-time collaboration tools</li>
              <li>Smart analytics to guide decisions</li>
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=80"
            alt="Innovation team"
            className="w-full rounded-xl shadow-xl"
          />
        </section>

        {/* Stats & Credibility */}
        <section className="bg-sky-50 p-10 rounded-xl shadow-lg text-center grid md:grid-cols-3 gap-6 text-sky-800">
          <div>
            <p className="text-5xl font-bold">98%</p>
            <p className="mt-2 text-sm">User Satisfaction</p>
          </div>
          <div>
            <p className="text-5xl font-bold">20K+</p>
            <p className="mt-2 text-sm">Ideas Captured</p>
          </div>
          <div>
            <p className="text-5xl font-bold">30+</p>
            <p className="mt-2 text-sm">Countries Served</p>
          </div>
        </section>

        {/* Differentiators */}
        <section className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-semibold text-center text-sky-700 mb-6">What Sets Us Apart?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-700">
            <div className="bg-sky-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="font-semibold text-lg text-sky-800 mb-2">User-Centered Design</h4>
              <p>We prioritize intuitive workflows and minimal training overhead.</p>
            </div>
            <div className="bg-sky-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="font-semibold text-lg text-sky-800 mb-2">Data-Driven Intelligence</h4>
              <p>Built-in analytics guide your decisions across the IP lifecycle.</p>
            </div>
            <div className="bg-sky-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="font-semibold text-lg text-sky-800 mb-2">Security & Compliance</h4>
              <p>We take IP protection seriously. Enterprise-grade security comes standard.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16">
          <h3 className="text-3xl font-bold text-sky-800 mb-4">Let’s Build the Future of IP Together</h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-6">
            Ready to streamline your innovation process? Explore how Triangle IP can empower your team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition"
          >
            Contact Us
          </a>
        </section>
      </main>
    </div>
  );
}
