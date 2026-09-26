declare global {
  interface CustomJwtSessionClaims {
    email?: string;
    fullName?: string;
    image?: string;
  }
}