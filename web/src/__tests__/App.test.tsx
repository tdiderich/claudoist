import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

const findAgendaHeading = () => screen.getByText(/call agenda/i);

describe("App", () => {
  it("updates agenda markdown when Make agenda is clicked", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /make agenda/i });
    fireEvent.click(button);
    expect(findAgendaHeading()).toBeInTheDocument();
  });
});
