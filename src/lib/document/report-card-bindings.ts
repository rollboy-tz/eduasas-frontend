import { BindingField } from "../../components/documents/document-template.types";

/**
 * @file report-card-bindings.ts - the binding fields + sample preview
 * data specifically for `kind: "report-card"` templates. Other document
 * kinds (certificate, letter) would get their own binding sets in a
 * similar file - this is what makes the editor reusable across features:
 * the SAME canvas/editor UI, different available tokens per kind.
 */

export const REPORT_CARD_BINDINGS: BindingField[] = [
  { path: "studentName", label: "Student name", kind: "text" },
  { path: "admissionNo", label: "Admission No", kind: "text" },
  { path: "className", label: "Class", kind: "text" },
  { path: "term", label: "Term", kind: "text" },
  { path: "year", label: "Year", kind: "text" },
  { path: "position", label: "Position", kind: "text" },
  { path: "averageScore", label: "Average score", kind: "text" },
  { path: "overallGrade", label: "Overall grade", kind: "text" },
  { path: "attendance.present", label: "Days present", kind: "text" },
  { path: "attendance.total", label: "Total days", kind: "text" },
  { path: "teacherComment", label: "Teacher comment", kind: "text" },
  { path: "headTeacherComment", label: "Head teacher comment", kind: "text" },
  { path: "schoolName", label: "School name", kind: "text" },
  { path: "logoUrl", label: "School logo", kind: "image" },
  { path: "studentPhotoUrl", label: "Student photo", kind: "image" },
  { path: "subjects", label: "Subjects table", kind: "array" },
];

/** Sample record used to preview a report-card template while editing. */
export const REPORT_CARD_SAMPLE_DATA: Record<string, unknown> = {
  studentName: "Amina Hassan",
  admissionNo: "ADM/2026/014",
  className: "Form 2 Blue",
  term: "Term 2",
  year: "2026",
  position: "3rd of 41",
  averageScore: "78.4",
  overallGrade: "B+",
  attendance: { present: 88, total: 92 },
  teacherComment: "A diligent student who consistently participates in class.",
  headTeacherComment: "Keep up the good work, Amina.",
  schoolName: "EduAsas Secondary School",
  logoUrl: "/icons/google-play.png",
  studentPhotoUrl: "",
  subjects: [
    { subject: "Mathematics", score: 82, grade: "A" },
    { subject: "English", score: 74, grade: "B" },
    { subject: "Physics", score: 69, grade: "B" },
    { subject: "Chemistry", score: 71, grade: "B" },
    { subject: "Biology", score: 88, grade: "A" },
    { subject: "History", score: 76, grade: "B" },
  ],
};