export const extractIdentifiers = (
  text: string
): { name: string; email: string } => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/); // crude name match (e.g., John Smith)

  return {
    name: nameMatch ? nameMatch[0] : "Unknown",
    email: emailMatch ? emailMatch[0] : "",
  };
};
