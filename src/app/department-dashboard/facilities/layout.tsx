import React from 'react';

interface FacilitiesLayoutProps {
  children: React.ReactNode;
}

const FacilitiesLayout: React.FC<FacilitiesLayoutProps> = ({ children }) => {
  return (
    <div>
      {/* You can add any shared layout elements for facilities pages here */}
      {children}
    </div>
  );
};

export default FacilitiesLayout;