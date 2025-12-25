import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components"; // Import ThemeProvider
import { parseMessageWithPageRefBadges } from "./ChatMessageParser";
import { theme } from "../../theme/index";
import { DocumentResponse } from "../../types/apiTypes";

describe("parseMessageWithPageRefBadges", () => {
  it("renders plain text correctly", () => {
    const message = "This is a test message.";
    const documents: DocumentResponse[] = [];
    const onBadgeClick = jest.fn();

    const {container} = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
    );

    expect(container.textContent).toBe("This is a test message.");
  });

  it("renders PageRefBadge for <<>> references", () => {
    const message = "See page <<chunk_10>> for details.";
    const documents: DocumentResponse[] = [
      {id: "chunk_10", page: 1, content: "Document 1"}, // this is the document reference
      {id: "chunk_20", page: 3, content: "Document 2"} // this is not referenced
    ];
    const onBadgeClick = jest.fn();

    const {container} = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
    );

    const firstChild = container.firstChild

    expect(firstChild?.nodeName).toBe("DIV");
    expect(firstChild?.childNodes.length).toBe(3);
    expect(firstChild?.childNodes[0].nodeName).toBe("SPAN");
    expect(firstChild?.childNodes[0].textContent).toBe("See page ");
    expect(firstChild?.childNodes[1].textContent).toBe("[2]");
    expect(firstChild?.childNodes[2].textContent).toBe(" for details.");
  });

  it("renders multiple PageRefBadges", () => {
    const message = "See page for details. <<chunk_42>> <<chunk_12>>";
    const documents: DocumentResponse[] = [
      {id: "chunk_10", page: 1, content: "Document 1"},
      {id: "chunk_12", page: 5, content: "Document 2"},
      {id: "chunk_42", page: 17, content: "Document 3"}
    ];
    const onBadgeClick = jest.fn();

    const {container} = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
    );

    const spans = container.querySelectorAll("span");
    expect(spans.length).toBe(4);
    expect(spans[0].textContent).toBe("See page for details. ");
    expect(spans[1].textContent).toBe("[18]");
    expect(spans[2].textContent).toBe(" ");
    expect(spans[3].textContent).toBe("[6]");
  });

  it("calls onBadgeClick with the correct page number when badge is clicked", () => {
    const message = "See page <<chunk_1>> for details.";
    const documents: DocumentResponse[] = [
      {id: "chunk_1", page: 1, content: "Document 1"},
    ];
    const onBadgeClick = jest.fn();

    render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
    );

    const badge = screen.getByText("[2]"); // page number is incremented by 1
    fireEvent.click(badge);

    expect(onBadgeClick).toHaveBeenCalledWith(1, "Document 1"); // page number index
  });
});