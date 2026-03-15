import { useState } from 'react';

export function useStudentProfile() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const openProfile = (studentId) => {
    setSelectedStudent(studentId);
  };

  const closeProfile = () => {
    setSelectedStudent(null);
  };

  return {
    selectedStudent,
    openProfile,
    closeProfile
  };
}
