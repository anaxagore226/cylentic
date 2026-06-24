export type SessionUser = {
  id: string;
  identifier: string;
  role: "admin" | "teacher" | "student";
  establishmentId: string;
  mustChangePassword: boolean;
  firstName: string;
  lastName: string;
  email: string;
};
