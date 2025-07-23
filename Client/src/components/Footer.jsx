import React from 'react';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#1E293B] text-[#E2E8F0] py-10 font-['Inter',sans-serif] relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo / Description */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Triangle IP</h3>
          <p className="text-sm text-[#94A3B8]">
            Triangle IP is your trusted platform to manage and explore the US Patent Attorney Roster with clarity, control, and collaboration.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm text-[#CBD5E1]">
            <li><a href="/explore" className="hover:text-[#38BDF8] transition">Explore Data</a></li>
            <li><a href="/about" className="hover:text-[#38BDF8] transition">About</a></li>
            <li><a href="/contact" className="hover:text-[#38BDF8] transition">Contact</a></li>
            <li><a href="/privacypolicy" className="hover:text-[#38BDF8] transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Contact Us</h4>
          <ul className="text-sm text-[#CBD5E1] space-y-2">
            <li>Email: <a href="mailto:support@triangleip.com" className="hover:text-[#38BDF8]">support@triangleip.com</a></li>
            <li>Phone: +1 (800) 123-4567</li>
            <li>Address: 123 Innovation Way, Silicon Valley, CA</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-white">Follow Us</h4>
          <div className="flex gap-4 text-[#CBD5E1]">
            <a href="#" className="hover:text-[#38BDF8] text-xl"><FaLinkedin /></a>
            <a href="#" className="hover:text-[#38BDF8] text-xl"><FaTwitter /></a>
            <a href="#" className="hover:text-[#38BDF8] text-xl"><FaGithub /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-slate-600 mt-10 pt-6 text-center text-sm text-[#94A3B8]">
        © {new Date().getFullYear()} Triangle IP. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
