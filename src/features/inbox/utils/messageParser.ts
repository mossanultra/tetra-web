import {
  InboxMessageContent,
  SystemMessageContent,
  ReplyMessageContent,
  NewEventMessageContent,
  ParsedMessageContent,
} from "../types/Inbox";

export interface ParsedMessage {
  type: string;
  displayContent: string;
  parsedContent: ParsedMessageContent | null;
}

/**
 * Parse message content from JSON string format
 * Handles both new JSON format and legacy plain text format
 */
export function parseMessageContent(
  message: InboxMessageContent,
): ParsedMessage {
  try {
    const parsedContent = JSON.parse(message.content) as ParsedMessageContent;

    if (message.type === "system" || message.type === "ai") {
      const systemContent = parsedContent as SystemMessageContent;
      return {
        type: message.type,
        displayContent: systemContent.message,
        parsedContent,
      };
    } else if (message.type === "reply") {
      const replyContent = parsedContent as ReplyMessageContent;
      return {
        type: message.type,
        displayContent: replyContent.content,
        parsedContent,
      };
    } else if (message.type === "newEvent") {
      console.log("New event message:", parsedContent);
      const eventContent = parsedContent as NewEventMessageContent;
      // Display event title and location
      return {
        type: message.type,
        displayContent: `${eventContent.title}\n📍 ${eventContent.address}`,
        parsedContent,
      };
    }

    // Unknown type, fallback to raw content
    console.warn(`Unknown message type: ${message.type}`);
    return {
      type: message.type,
      displayContent: message.content,
      parsedContent: null,
    };
  } catch (error) {
    // JSON parse failed - likely legacy plain text format
    console.debug(
      "Failed to parse message content as JSON, using raw content:",
      error,
    );
    return {
      type: message.type,
      displayContent: message.content,
      parsedContent: null,
    };
  }
}
