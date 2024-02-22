import React, { useState } from "react";
import { driver } from "driver.js";

const TestingTour = ({ driverObj }) => {
  const [help, setHelp] = useState(false);

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};

// Function to initialize driverObj
export const initializeDriver = (
  localStorageId,
  localStorageTitle,
  localStorageDescription,
  setHelp
) => {
  return driver({
    showProgress: true,
    steps: [
      {
        element: `#${localStorageId}`, // Set the ID dynamically
        popover: {
          title: localStorageTitle, // Set the title dynamically
          description: localStorageDescription, // Set the description dynamically
          side: "left",
          align: "start",
        },
      },
      {
        element: `#${localStorageId}`, // Set the ID dynamically
        popover: {
          title: localStorageTitle, // Set the title dynamically
          description: localStorageDescription, // Set the description dynamically
          side: "left",
          align: "start",
        },
      },
    ],
    onCloseClick: () => {
      setHelp(false);
    },
    onDestroyed: () => {
      setHelp(false);
    },
    active: false,
  });
};

export default TestingTour;
