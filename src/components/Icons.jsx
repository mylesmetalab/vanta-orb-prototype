const I = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    {children}
  </svg>
);

export const ClockIcon = () => (
  <I>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7 3V8.41421L10.2929 11.7071L11.7071 10.2929L9 7.58579V3H7Z"
      fill="white"
    />
  </I>
);

export const XIcon = () => (
  <I>
    <path
      d="M5.17172 8L1.08594 3.91421L3.91436 1.08578L8.00015 5.17157L12.0859 1.08578L14.9144 3.91421L10.8286 8L14.9144 12.0858L12.0859 14.9142L8.00015 10.8284L3.91436 14.9142L1.08594 12.0858L5.17172 8Z"
      fill="white"
    />
  </I>
);

export const MicIcon = ({ c = "#000" }) => (
  <I>
    <path
      d="M5 3C5 1.34315 6.34315 0 8 0C9.65685 0 11 1.34315 11 3V7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7V3Z"
      fill={c}
    />
    <path
      d="M9 13.9291V16H7V13.9291C3.60771 13.4439 1 10.5265 1 7V6H3V7C3 9.76142 5.23858 12 8 12C10.7614 12 13 9.76142 13 7V6H15V7C15 10.5265 12.3923 13.4439 9 13.9291Z"
      fill={c}
    />
  </I>
);

export const PauseIcon = () => (
  <I>
    <path d="M7 1H2V15H7V1Z" fill="white" />
    <path d="M14 1H9V15H14V1Z" fill="white" />
  </I>
);

export const PlusIcon = () => (
  <I>
    <path d="M9 0H7V7H0V9H7V16H9V9H16V7H9V0Z" fill="white" />
  </I>
);

export const CheckIcon = () => (
  <I>
    <path d="M6.5 12.5L1.5 7.5L3 6L6.5 9.5L13 3L14.5 4.5L6.5 12.5Z" fill="black" />
  </I>
);
