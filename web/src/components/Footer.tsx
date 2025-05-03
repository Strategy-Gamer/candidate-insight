import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c1c84] text-white text-center py-4 px-4 font-serif">
      <div className="mx-auto max-w-3xl space-y-3">
        <p className="text-sm leading-5 md:text-base md:leading-6">
            Built by the Candidate Insight Team at the University of Tennessee, Knoxville
        </p>
        <p className="text-xs text-gray-200/90 leading-4">
            For educational purposes only.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
