// import React from "react";

// interface ModalProps {
//   open: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
// }

// export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
//       <div className="bg-white p-5 rounded-lg w-[90%] lg:max-w-[500px] sm:max-w-[400px] relative overflow-y-auto">
//         <button className="absolute top-2 right-4 text-xl cursor-pointer" onClick={onClose}>
//           &times;
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// };

import React from "react"; 

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean; // New prop for width control
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, wide }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-[1000]">
      <div 
        className={`bg-white p-5 rounded-lg relative overflow-y-auto 
          ${wide ? "w-[80vw] max-w-6xl h-[90vh]" : "w-[90%] lg:max-w-[500px] sm:max-w-[400px]"}`}
      >
        {/* Close Button */}
        <button className="absolute top-2 right-4 text-xl cursor-pointer" onClick={onClose}>
          &times;
        </button>

        {children}
      </div>
    </div>
  );
};
