import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "styled-components"; // Import ThemeProvider
import { parseMessageWithPageRefBadges } from "./ChatMessageParser";
import { theme } from "../../theme";

describe("parseMessageWithPageRefBadges", () => {
  it("renders plain text correctly", () => {
    const message = "This is a test message.";
    const onBadgeClick = jest.fn();

    const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, onBadgeClick)}</div>
        </ThemeProvider>
    );

    expect(container.textContent).toBe("This is a test message.");
  });

  it("renders PageRefBadge for <<>> references", () => {
    const message = "See page <<1>> for details.";
    const onBadgeClick = jest.fn();

    const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, onBadgeClick)}</div>
        </ThemeProvider>
    );

    console.log(container.innerHTML)
    const firstChild = container.firstChild
    expect(firstChild?.nodeName).toBe("DIV");
    expect(firstChild?.childNodes.length).toBe(3);
    expect(firstChild?.childNodes[0].nodeName).toBe("SPAN");
    expect(firstChild?.childNodes[0].textContent).toBe("See page");
    expect(firstChild?.childNodes[1].textContent).toBe("2");
    expect(firstChild?.childNodes[2].textContent).toBe("for details.");
  });

  it("renders multiple PageRefBadges", () => {
    const message = "See page for details. <<42>> <<12>>";
    const onBadgeClick = jest.fn();

    const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, onBadgeClick)}</div>
        </ThemeProvider>
    );

    console.log(container.innerHTML)
    const spans = container.querySelectorAll("span");
    expect(spans.length).toBe(3);
    expect(spans[0].textContent).toBe("See page for details.");
    expect(spans[1].textContent).toBe("43");
    expect(spans[2].textContent).toBe("13");
  });

  it("calls onBadgeClick with the correct page number when badge is clicked", () => {
    const message = "See page <<1>> for details.";
    const onBadgeClick = jest.fn();

    render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, onBadgeClick)}</div>
        </ThemeProvider>
    );

    const badge = screen.getByText("2"); // page number is incremented by 1
    fireEvent.click(badge);

    expect(onBadgeClick).toHaveBeenCalledWith(1); // page number index
  });
});