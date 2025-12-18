"use server";

import { db } from "@/firebase/admin";

export interface DashboardStats {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  totalClasses: number;
  activeClasses: number;
  inactiveClasses: number;
  totalSubjects: number;
  totalInterviews: number;
  totalUsers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      branchesSnapshot,
      classesSnapshot,
      subjectsSnapshot,
      interviewsSnapshot,
      usersSnapshot,
    ] =
      await Promise.all([
        db.collection("branches").get(),
        db.collection("classes").get(),
        db.collection("subjects").get(),
        db.collection("interviews").get(),
        db.collection("users").get(),
      ]);

    const branches = branchesSnapshot.docs.map((doc) => doc.data());
    const classes = classesSnapshot.docs.map((doc) => doc.data());

    const totalBranches = branches.length;
    const activeBranches = branches.filter((b) => b.status === "active").length;
    const inactiveBranches = totalBranches - activeBranches;

    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.status === "active").length;
    const inactiveClasses = totalClasses - activeClasses;

    const subjects = subjectsSnapshot.docs.map((doc) => doc.data());

    return {
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalClasses,
      activeClasses,
      inactiveClasses,
      totalSubjects: subjects.length,
      totalInterviews: interviewsSnapshot.size,
      totalUsers: usersSnapshot.size,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalBranches: 0,
      activeBranches: 0,
      inactiveBranches: 0,
      totalClasses: 0,
      activeClasses: 0,
      inactiveClasses: 0,
      totalSubjects: 0,
      totalInterviews: 0,
      totalUsers: 0,
    };
  }
}

