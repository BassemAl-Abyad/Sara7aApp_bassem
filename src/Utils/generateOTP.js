import { customAlphabet } from "nanoid";

export function generateOTP() {
    return customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6)();
}