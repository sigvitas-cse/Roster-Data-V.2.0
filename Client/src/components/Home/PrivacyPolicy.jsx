import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800">
      <header className="bg-white shadow-md py-6 px-6 md:px-10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-700">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-16 space-y-10 text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">1. Introduction</h2>
          <p>
            At Triangle IP, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal Info:</strong> such as name, email, and contact details when you register or contact us.</li>
            <li><strong>Usage Data:</strong> including IP address, browser type, pages visited, and time spent on our site.</li>
            <li><strong>Cookies:</strong> to personalize content and enhance user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">3. How We Use Your Information</h2>
          <p>
            We use the collected data to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide and improve our services</li>
            <li>Send service updates and relevant communication</li>
            <li>Respond to support requests</li>
            <li>Ensure legal and regulatory compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">4. Sharing of Data</h2>
          <p>
            We do not sell your personal information. We may share data with trusted third-party services who help us operate our platform, under strict confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">5. Data Security</h2>
          <p>
            We take data security seriously and use industry-standard measures to protect your information, including encryption, access control, and secure servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">6. Your Rights</h2>
          <p>
            You have the right to access, modify, or delete your personal data. You may contact us at any time to request such actions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">7. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-sky-800 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please <a href="/contact" className="text-sky-600 hover:underline">contact us</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
