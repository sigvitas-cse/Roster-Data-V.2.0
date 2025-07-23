import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const goHome = () => {
    navigate('/');
    setIsOpen(false);
  };

  const goBack = () => {
    navigate(-1);
    setIsOpen(false);
  };

  const handleSignUp = () => {
    navigate('/NewUserLoginPage');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setAboutOpen(false);
    setContactOpen(false);
  };

  const toggleAbout = () => {
    setAboutOpen(!aboutOpen);
    setContactOpen(false);
  };

  const toggleContact = () => {
    setContactOpen(!contactOpen);
    setAboutOpen(false);
  };

  // Animation variants for the dropdown menu and submenus
  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  const submenuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  };

  return (
    <header className="bg-[#1E293B] bg-opacity-95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 py-4 font-['Inter',sans-serif] relative z-20">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <img
          onClick={goHome}
          src="/Triangle-IP-Logo.png"
          alt="Triangle IP Logo"
          className="h-12 sm:h-14 cursor-pointer"
        />
      </div>

      {/* Toggle Icon for Small Screens */}
      <div className="sm:hidden">
        <button
          onClick={toggleMenu}
          className="text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded"
        >
          <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
        </button>
      </div>

      {/* Navigation for Larger Screens */}
      <div className="hidden sm:flex items-center gap-4">
        {/* About with Dropdown */}
        <div className="relative group">
          <a
            href="#"
            className="text-[#E2E8F0] text-base font-medium hover:text-[#38BDF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded px-2"
            onClick={(e) => e.preventDefault()}
          >
            About
          </a>
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 z-10">
            <div className="p-4">
              <h4 className="text-[#1E293B] text-base font-semibold mb-2">About Attorney Roster</h4>
              <p className="text-[#64748B] text-sm mb-2">
                The Attorney Roster Data system is designed to manage and maintain detailed records of attorneys, typically sourced from official or regulatory bodies. Each attorney's profile includes fields such as:
              </p>
              <ul className="text-[#64748B] text-sm list-disc pl-4 mb-2">
                <li>Name</li>
                <li>Registration Code (regCode)</li>
                <li>Organization</li>
                <li>Address (Line 1, City, State, Zip Code)</li>
                <li>Phone Number</li>
                <li>And other relevant identifiers</li>
              </ul>
              <p className="text-[#64748B] text-sm mb-2">
                This data is stored securely in a database and supports bulk updates via Excel file comparison. When a new roster file is uploaded, the system:
              </p>
              <ul className="text-[#64748B] text-sm list-disc pl-4 mb-2">
                <li>Compares each entry using the unique regCode.</li>
                <li>Updates existing records if there are changes.</li>
                <li>Generates downloadable reports for updated or full data.</li>
              </ul>
              <p className="text-[#64748B] text-sm">
                The platform ensures accuracy, traceability, and time-efficiency, especially useful for IP firms, legal departments, and compliance teams that handle attorney credential tracking regularly.
              </p>
            </div>
          </div>
        </div>

        {/* Contact with Dropdown */}
        <div className="relative group">
          <a
            href="/contact"
            className="text-[#E2E8F0] text-base font-medium hover:text-[#38BDF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded px-2"
            onClick={(e) => e.preventDefault()}
          >
            Contact
          </a>
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-all duration-200 z-10">
            <div className="p-4">
              <h4 className="text-[#1E293B] text-base font-semibold mb-2">Get in Touch</h4>
              <p className="text-[#64748B] text-sm mb-1">Email: support@triangleip.com</p>
              <p className="text-[#64748B] text-sm mb-3">Phone: +1-800-555-1234</p>
              <a
                href="/contact"
                className="text-[#38BDF8] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {location.pathname !== '/' && (
          <button
            onClick={goBack}
            className="px-4 py-2 bg-[#38BDF8] text-white text-base font-medium rounded-lg hover:bg-[#2B9FE7] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          >
            <i className="fa-solid fa-arrow-left mr-2" /> Back
          </button>
        )}
        <button
          onClick={goHome}
          className="px-4 py-2 bg-[#38BDF8] text-white text-base font-medium rounded-lg hover:bg-[#2B9FE7] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
        >
          <i className="fa-solid fa-house mr-2" /> Home
        </button>
        <button
          onClick={handleSignUp}
          className="px-4 py-2 bg-[#38BDF8] text-white text-base font-medium rounded-lg hover:bg-[#2B9FE7] transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
        >
          Sign Up
        </button>
      </div>

      {/* Dropdown Menu for Small Screens */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute top-[calc(100%+4px)] left-4 right-4 bg-[#1E293B] bg-opacity-95 rounded-xl shadow-lg py-4 sm:hidden border border-[#38BDF8]/20 overflow-hidden"
          >
            <ul className="flex flex-col">
              {/* About with Submenu */}
              <li>
                <button
                  onClick={toggleAbout}
                  className="w-full text-left px-6 py-3 text-[#E2E8F0] text-base font-medium hover:bg-[#2A4365] hover:text-[#38BDF8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] flex items-center justify-between"
                >
                  <span>About</span>
                  <i className={`fa-solid fa-chevron-${aboutOpen ? 'up' : 'down'}`} />
                </button>
                <AnimatePresence>
                  {aboutOpen && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="bg-[#2A4365] px-6 py-3"
                    >
                      <h4 className="text-[#E2E8F0] text-sm font-semibold mb-2">About Attorney Roster</h4>
                      <p className="text-[#A3BFFA] text-sm mb-2">
                        The Attorney Roster Data system is designed to manage and maintain detailed records of attorneys, typically sourced from official or regulatory bodies. Each attorney's profile includes fields such as:
                      </p>
                      <ul className="text-[#A3BFFA] text-sm list-disc pl-4 mb-2">
                        <li>Name</li>
                        <li>Registration Code (regCode)</li>
                        <li>Organization</li>
                        <li>Address (Line 1, City, State, Zip Code)</li>
                        <li>Phone Number</li>
                        <li>And other relevant identifiers</li>
                      </ul>
                      <p className="text-[#A3BFFA] text-sm mb-2">
                        This data is stored securely in a database and supports bulk updates via Excel file comparison. When a new roster file is uploaded, the system:
                      </p>
                      <ul className="text-[#A3BFFA] text-sm list-disc pl-4 mb-2">
                        <li>Compares each entry using the unique regCode.</li>
                        <li>Updates existing records if there are changes.</li>
                        <li>Generates downloadable reports for updated or full data.</li>
                      </ul>
                      <p className="text-[#A3BFFA] text-sm">
                        The platform ensures accuracy, traceability, and time-efficiency, especially useful for IP firms, legal departments, and compliance teams that handle attorney credential tracking regularly.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              {/* Contact with Submenu */}
              <li>
                <button
                  onClick={toggleContact}
                  className="w-full text-left px-6 py-3 text-[#E2E8F0] text-base font-medium hover:bg-[#2A4365] hover:text-[#38BDF8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] flex items-center justify-between"
                >
                  <span>Contact</span>
                  <i className={`fa-solid fa-chevron-${contactOpen ? 'up' : 'down'}`} />
                </button>
                <AnimatePresence>
                  {contactOpen && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="bg-[#2A4365] px-6 py-3"
                    >
                      <h4 className="text-[#E2E8F0] text-sm font-semibold mb-2">Get in Touch</h4>
                      <p className="text-[#A3BFFA] text-sm mb-1">Email: support@triangleip.com</p>
                      <p className="text-[#A3BFFA] text-sm mb-3">Phone: +1-800-555-1234</p>
                      <a
                        href="/contact"
                        className="text-[#38BDF8] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                        onClick={() => setIsOpen(false)}
                      >
                        Contact Us
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              {location.pathname !== '/' && (
                <li>
                  <button
                    onClick={goBack}
                    className="w-full text-left px-6 py-3 text-[#E2E8F0] text-base font-medium hover:bg-[#2A4365] hover:text-[#38BDF8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] flex items-center"
                  >
                    <i className="fa-solid fa-arrow-left mr-3" /> Back
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={goHome}
                  className="w-full text-left px-6 py-3 text-[#E2E8F0] text-base font-medium hover:bg-[#2A4365] hover:text-[#38BDF8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] flex items-center"
                >
                  <i className="fa-solid fa-house mr-3" /> Home
                </button>
              </li>
              <li>
                <button
                  onClick={handleSignUp}
                  className="w-full text-left px-6 py-3 text-[#E2E8F0] text-base font-medium hover:bg-[#2A4365] hover:text-[#38BDF8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] flex items-center"
                >
                  <i className="fa-solid fa-user-plus mr-3" /> Sign Up
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;