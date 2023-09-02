import bcrypt from 'bcrypt';

export async function checkPassword(password: string, hash: string) {
    const match = await bcrypt.compare(password, hash);
    return match;
}