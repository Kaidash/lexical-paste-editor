export default function isBase64(base64String: string): boolean {
  // Check if the string is in the correct format for a base64 string
  const regex: RegExp = /^data:image\/(png|jpg|jpeg|svg);base64,/;

  if (!regex.test(base64String)) {
    return false; // Not in the correct format for a base64 image
  }

  return true;
}
