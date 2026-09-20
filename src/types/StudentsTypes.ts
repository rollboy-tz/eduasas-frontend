/**
 * @file student-types.ts
 * @description Comprehensive type definitions for student profiles, class enrollments, sections, and subject mapping.
 */

/** =========================================================
   1. SECTION STUDENT SCHEMA (Specific to Section Endpoints)
   ========================================================= */

export interface SectionStudent {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: "MALE" | "FEMALE";
    pictureUrl: string | null;
    admissionNo: string;
    premsNumber: string | null;
    bemisNumber: string | null;
    indexNo: string | null;
    enrollmentStatus: "ACTIVE";
    studentStatus: "ACTIVE" | "DROPPED" | "EXEMPTED";
    createdAt: string;
}

/** =========================================================
   2. GENERAL CLASS STUDENT ENROLLMENT SCHEMA
   (From /classes/[code]/students endpoint)
   ========================================================= */

export interface StudentSection {
    id: string;
    name: string;
}

export interface StudentStream {
    id: string;
    name: string;
    code: string | null;
}

export interface StudentAcademicYear {
    id: string;
    year: number;
}

export interface StudentSubject {
    studentSubjectId: string;
    classSubjectId: string;
    schoolSubjectId: string;
    name: string | null;
    code: string | null;
    status: "ACTIVE" | "DROPPED" | "EXEMPTED";
}

export interface ClassStudentItem {
    enrollmentId: string;
    profileId: string;
    admissionNo: string;
    systemId: string;
    fullName: string;
    gender: string;
    photoUrl: string | null;
    status: string;
    section: StudentSection | null;
    stream: StudentStream | null;
    academicYear: StudentAcademicYear | null;
    subjects: StudentSubject[];
    totalSubjects: number;
}

/** =========================================================
   3. STUDENT SUBJECT DETAIL SCHEMA
   (From /classes/students/[id]/subjects endpoint)
   ========================================================= */

export interface StudentSubjectInfo {
    studentSubjectId: string;
    classSubjectId: string;
    name: string | null;
    code: string | null;
}

export interface StudentSubjectDetailItem {
    enrollmentId: string;
    profileId: string;
    admissionNo: string;
    systemId: string;
    fullName: string;
    gender: string;
    photoUrl: string | null;
    status: string;
    section: StudentSection | null;
    stream: StudentStream | null;
    subjectInfo?: StudentSubjectInfo | undefined;
}