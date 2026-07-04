export type Role = "reader" | "librarian" | "superadmin";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar: string;
  enrolledCourses?: string[];
  joinedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
  cover: string;
  description: string;
}

export interface CourseModule {
  id: string;
  title: string;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  modules: CourseModule[];
  linkedBooks: string[];
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: string;
  dueAt: string;
  status: "active" | "returned" | "overdue";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorId: string;
}

export interface MainData {
  users: User[];
  books: Book[];
  courses: Course[];
  loans: Loan[];
  announcements: Announcement[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
}
