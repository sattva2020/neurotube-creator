/** Contract for password hashing (abstracts bcrypt/argon2) */
export interface IPasswordHasher {
  /** Hash a plain-text password */
  hash(password: string): Promise<string>;

  /** Verify a plain-text password against a hash */
  verify(password: string, hash: string): Promise<boolean>;
}
