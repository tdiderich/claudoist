import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Fraunces', 'Times New Roman', serif"
  },
  colors: {
    slate: {
      50: "#f7f6f2",
      100: "#efece4",
      200: "#d6d2c6",
      300: "#b9b4a3",
      400: "#8f8a7a",
      500: "#6c6759",
      600: "#575243",
      700: "#454132",
      800: "#333021",
      900: "#222012"
    },
    ember: {
      500: "#f05a28",
      600: "#cf4c22"
    },
    ink: {
      500: "#0b1c1c",
      600: "#081414"
    }
  },
  styles: {
    global: {
      "html, body": {
        background: "#f7f6f2",
        color: "#0b1c1c"
      }
    }
  }
});
