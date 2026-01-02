import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components"; // Import ThemeProvider
import { parseMessageWithPageRefBadges } from "./ChatMessageParser";
import theme from "../../../theme";
import { DocumentResponse } from "../../../types/apiTypes";

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

    // With markdown rendering, the structure is now MarkdownContent > p > spans and badges
    const badge = screen.getByText("[2]");
    expect(badge).toBeTruthy();
    expect(container.textContent).toContain("See page");
    expect(container.textContent).toContain("[2]");
    expect(container.textContent).toContain("for details.");

    // Verify the badge is clickable
    fireEvent.click(badge);
    expect(onBadgeClick).toHaveBeenCalledWith(1, "Document 1");
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

  // Markdown-specific tests
  describe("Markdown Support", () => {
    it("renders markdown headers", () => {
      const message = "# Header 1\n## Header 2\nParagraph text";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("h1")).toBeTruthy();
      expect(container.querySelector("h2")).toBeTruthy();
      expect(container.querySelector("h1")?.textContent).toBe("Header 1");
      expect(container.querySelector("h2")?.textContent).toBe("Header 2");
    });

    it("renders markdown lists", () => {
      const message = "- Item 1\n- Item 2\n- Item 3";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const listItems = container.querySelectorAll("li");
      expect(listItems.length).toBe(3);
      expect(listItems[0].textContent).toBe("Item 1");
      expect(listItems[1].textContent).toBe("Item 2");
      expect(listItems[2].textContent).toBe("Item 3");
    });

    it("renders ordered lists", () => {
      const message = "1. First\n2. Second\n3. Third";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("ol")).toBeTruthy();
      const listItems = container.querySelectorAll("li");
      expect(listItems.length).toBe(3);
    });

    it("renders inline code", () => {
      const message = "Use `inline code` here.";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const codeElement = container.querySelector("code");
      expect(codeElement).toBeTruthy();
      expect(codeElement?.textContent).toBe("inline code");
    });

    it("renders code blocks", () => {
      const message = "```\ncode block\n```";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("pre")).toBeTruthy();
      expect(container.querySelector("code")).toBeTruthy();
    });

    it("renders bold and italic text", () => {
      const message = "**bold** and *italic* text";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("strong")?.textContent).toBe("bold");
      expect(container.querySelector("em")?.textContent).toBe("italic");
    });

    it("renders links", () => {
      const message = "[Click here](https://example.com)";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const link = container.querySelector("a");
      expect(link).toBeTruthy();
      expect(link?.getAttribute("href")).toBe("https://example.com");
      expect(link?.textContent).toBe("Click here");
    });

    it("preserves chunk references within markdown", () => {
      const message = "**Bold text** with reference <<chunk_10>> in markdown.";
      const documents: DocumentResponse[] = [
        { id: "chunk_10", page: 5, content: "Document content" }
      ];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const badge = screen.getByText("[6]");
      expect(badge).toBeTruthy();
      expect(container.querySelector("strong")?.textContent).toBe("Bold text");
    });

    it("handles chunk references in lists", () => {
      const message = "- Item with <<chunk_1>>\n- Another item <<chunk_2>>";
      const documents: DocumentResponse[] = [
        { id: "chunk_1", page: 1, content: "Doc 1" },
        { id: "chunk_2", page: 3, content: "Doc 2" }
      ];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const badges = screen.getAllByText(/\[\d+\]/);
      expect(badges.length).toBe(2);
      expect(badges[0].textContent).toBe("[2]");
      expect(badges[1].textContent).toBe("[4]");
    });

    it("handles multiple chunk references with markdown formatting", () => {
      const message = "See **page** <<chunk_1>> and _also_ <<chunk_2>> for details.";
      const documents: DocumentResponse[] = [
        { id: "chunk_1", page: 1, content: "Doc 1" },
        { id: "chunk_2", page: 3, content: "Doc 2" }
      ];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      const badges = screen.getAllByText(/\[\d+\]/);
      expect(badges.length).toBe(2);
      expect(container.querySelector("strong")?.textContent).toBe("page");
      expect(container.querySelector("em")?.textContent).toBe("also");
    });

    it("handles empty messages", () => {
      const message = "";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const result = parseMessageWithPageRefBadges(message, documents, onBadgeClick);
      expect(result).toBeNull();
    });

    it("renders strikethrough (GFM)", () => {
      const message = "~~strikethrough~~";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("del")?.textContent).toBe("strikethrough");
    });

    it("renders tables (GFM)", () => {
      const message = "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
      const documents: DocumentResponse[] = [];
      const onBadgeClick = jest.fn();

      const { container } = render(
        <ThemeProvider theme={theme}>
          <div>{parseMessageWithPageRefBadges(message, documents, onBadgeClick)}</div>
        </ThemeProvider>
      );

      expect(container.querySelector("table")).toBeTruthy();
      expect(container.querySelector("th")).toBeTruthy();
      expect(container.querySelector("td")).toBeTruthy();
    });
  });
});