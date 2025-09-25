// API Route Migration Script
// This script maps old routes to new consolidated routes

const routeMappings = {
  // Profile routes (users + account)
  '/users/': '/profile/',
  '/account/': '/profile/',
  
  // Client routes (tutors)  
  '/tutors': '/clients',
  '/tutors/': '/clients/',
  
  // Pet routes
  '/pets': '/clients/pets',
  '/pets/': '/clients/pets/',
  '/pets?tutorId=': '/clients/',
  
  // Appointment routes
  '/availability': '/appointments/availability',
  '/availability/': '/appointments/availability/',
  '/consultation-types': '/appointments/types',
  '/consultation-types/': '/appointments/types/',
  
  // Medical routes
  '/prescriptions': '/medical/prescriptions',
  '/prescriptions/': '/medical/prescriptions/',
  '/medical-records': '/medical/records',
  '/medical-records/': '/medical/records/',
};

const specialCases = {
  // Handle pet queries with tutorId
  'pets?tutorId=': (match, fullString) => {
    const idMatch = fullString.match(/pets\?tutorId=(\d+)/);
    if (idMatch) {
      return `/clients/${idMatch[1]}/pets`;
    }
    return '/clients/pets';
  },
  
  // Handle prescription downloads
  'prescriptions/download/': '/medical/prescriptions/',
  'prescriptions/pet/': '/medical/prescriptions/',
  'medical-records/pet/': '/medical/records/',
};

export { routeMappings, specialCases };