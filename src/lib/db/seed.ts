import { db } from './index';
import { 
  schools, 
  users, 
  academicYears, 
  classes, 
  sections, 
  subjects,
  students,
  parentStudents,
  feeStructures,
  teacherAssignments
} from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create demo school
    const [school] = await db.insert(schools).values({
      name: 'Demo Academy',
      slug: 'demo-academy',
      address: '123 Education Street, Lahore',
      phone: '+92 300 1234567',
      email: 'info@demoacademy.com',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      isActive: true,
    }).returning();

    console.log('✅ School created:', school.name);

    // Create super admin
    const superAdminPassword = await bcrypt.hash('Admin@123', 12);
    const [superAdmin] = await db.insert(users).values({
      email: 'basithunyawrr@gmail.com',
      firstName: 'Basith',
      lastName: 'Admin',
      role: 'super_admin',
      passwordHash: superAdminPassword,
      isActive: true,
      emailVerified: new Date(),
    }).returning();

    console.log('✅ Super admin created:', superAdmin.email);

    // Create school admin
    const adminPassword = await bcrypt.hash('password123', 12);
    const [schoolAdmin] = await db.insert(users).values({
      email: 'admin@demoacademy.com',
      firstName: 'Ahmed',
      lastName: 'Raza',
      role: 'school_admin',
      schoolId: school.id,
      phone: '+92 300 1111111',
      passwordHash: adminPassword,
      isActive: true,
      emailVerified: new Date(),
    }).returning();

    console.log('✅ School admin created:', schoolAdmin.email);

    // Create teachers
    const teachers = [
      { firstName: 'Sarah', lastName: 'Khan', email: 'teacher@demoacademy.com', phone: '+92 300 2222222' },
      { firstName: 'Ali', lastName: 'Hassan', email: 'ali.hassan@demoacademy.com', phone: '+92 300 3333333' },
      { firstName: 'Fatima', lastName: 'Malik', email: 'fatima.malik@demoacademy.com', phone: '+92 300 4444444' },
    ];

    const teacherPassword = await bcrypt.hash('password123', 12);
    const createdTeachers = [];

    for (const teacher of teachers) {
      const [t] = await db.insert(users).values({
        ...teacher,
        role: 'teacher',
        schoolId: school.id,
        passwordHash: teacherPassword,
        isActive: true,
        emailVerified: new Date(),
      }).returning();
      createdTeachers.push(t);
    }

    console.log('✅ Teachers created:', createdTeachers.length);

    // Create academic year
    const [academicYear] = await db.insert(academicYears).values({
      schoolId: school.id,
      name: '2024-2025',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
    }).returning();

    console.log('✅ Academic year created:', academicYear.name);

    // Create classes and sections
    const classData = [
      { name: 'Grade 1', gradeLevel: 1, sections: ['A', 'B'] },
      { name: 'Grade 2', gradeLevel: 2, sections: ['A', 'B'] },
      { name: 'Grade 3', gradeLevel: 3, sections: ['A', 'B'] },
      { name: 'Grade 4', gradeLevel: 4, sections: ['A', 'B'] },
      { name: 'Grade 5', gradeLevel: 5, sections: ['A', 'B'] },
      { name: 'Grade 6', gradeLevel: 6, sections: ['A', 'B'] },
      { name: 'Grade 7', gradeLevel: 7, sections: ['A', 'B'] },
      { name: 'Grade 8', gradeLevel: 8, sections: ['A', 'B'] },
      { name: 'Grade 9', gradeLevel: 9, sections: ['A', 'B'] },
      { name: 'Grade 10', gradeLevel: 10, sections: ['A', 'B'] },
    ];

    const createdSections = [];

    for (const classInfo of classData) {
      const [cls] = await db.insert(classes).values({
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: classInfo.name,
        gradeLevel: classInfo.gradeLevel,
      }).returning();

      for (const sectionName of classInfo.sections) {
        const [section] = await db.insert(sections).values({
          schoolId: school.id,
          classId: cls.id,
          name: sectionName,
          capacity: 40,
        }).returning();
        createdSections.push({ ...section, className: classInfo.name });
      }
    }

    console.log('✅ Classes and sections created');

    // Create subjects
    const subjectData = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English', code: 'ENG' },
      { name: 'Science', code: 'SCI' },
      { name: 'Urdu', code: 'URD' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Islamic Studies', code: 'ISL' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Art & Craft', code: 'ART' },
      { name: 'Physical Education', code: 'PE' },
    ];

    const createdSubjects = [];

    for (const subject of subjectData) {
      const [s] = await db.insert(subjects).values({
        schoolId: school.id,
        ...subject,
      }).returning();
      createdSubjects.push(s);
    }

    console.log('✅ Subjects created:', createdSubjects.length);

    // Create sample students for Grade 5-A
    const grade5a = createdSections.find(s => s.className === 'Grade 5' && s.name === 'A');
    
    if (grade5a) {
      const studentData = [
        { firstName: 'Ahmed', lastName: 'Khan', gender: 'male', dob: '2014-03-15', roll: '001', guardian: 'Ali Khan', guardianEmail: 'ali.khan@email.com', guardianPhone: '+92 300 5555555' },
        { firstName: 'Fatima', lastName: 'Ahmed', gender: 'female', dob: '2014-05-22', roll: '002', guardian: 'Usman Ahmed', guardianEmail: 'usman@email.com', guardianPhone: '+92 300 6666666' },
        { firstName: 'Hassan', lastName: 'Ali', gender: 'male', dob: '2014-01-10', roll: '003', guardian: 'Ali Raza', guardianEmail: 'ali.raza@email.com', guardianPhone: '+92 300 7777777' },
        { firstName: 'Ayesha', lastName: 'Malik', gender: 'female', dob: '2014-07-18', roll: '004', guardian: 'Tariq Malik', guardianEmail: 'tariq@email.com', guardianPhone: '+92 300 8888888' },
        { firstName: 'Omar', lastName: 'Farooq', gender: 'male', dob: '2014-09-25', roll: '005', guardian: 'Farooq Shah', guardianEmail: 'farooq@email.com', guardianPhone: '+92 300 9999999' },
      ];

      const parentPassword = await bcrypt.hash('password123', 12);

      for (const student of studentData) {
        // Create student
        const [s] = await db.insert(students).values({
          schoolId: school.id,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender as 'male' | 'female',
          dateOfBirth: new Date(student.dob),
          sectionId: grade5a.id,
          rollNumber: student.roll,
          isActive: true,
        }).returning();

        // Create or find parent
        let parent = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, student.guardianEmail),
        });

        if (!parent) {
          const [p] = await db.insert(users).values({
            email: student.guardianEmail,
            firstName: student.guardian.split(' ')[0],
            lastName: student.guardian.split(' ').slice(1).join(' ') || '.',
            role: 'parent',
            schoolId: school.id,
            phone: student.guardianPhone,
            passwordHash: parentPassword,
            isActive: true,
            emailVerified: new Date(),
          }).returning();
          parent = p;
        }

        // Link parent to student
        await db.insert(parentStudents).values({
          schoolId: school.id,
          parentId: parent!.id,
          studentId: s.id,
          relationship: 'guardian',
          isPrimary: true,
        });
      }

      console.log('✅ Sample students created for Grade 5-A');
    }

    // Create fee structures
    const feeData = [
      { name: 'Tuition Fee', amount: 10000, feeType: 'tuition', classId: null },
      { name: 'Transport Fee', amount: 3000, feeType: 'transport', classId: null },
      { name: 'Lab Fee', amount: 1500, feeType: 'lab', classId: null },
      { name: 'Library Fee', amount: 500, feeType: 'library', classId: null },
      { name: 'Exam Fee', amount: 1000, feeType: 'exam', classId: null },
    ];

    for (const fee of feeData) {
      await db.insert(feeStructures).values({
        schoolId: school.id,
        name: fee.name,
        amount: fee.amount.toString(),
        feeType: fee.feeType,
        isRecurring: true,
        dueDayOfMonth: 10,
        lateFeeAmount: '500',
        lateFeeDaysAfterDue: 7,
        academicYearId: academicYear.id,
      });
    }

    console.log('✅ Fee structures created');

    // Assign teachers to subjects and sections
    const grade5aMath = createdSubjects.find(s => s.code === 'MATH');
    const grade5aEng = createdSubjects.find(s => s.code === 'ENG');

    if (grade5aMath && grade5a && createdTeachers[0]) {
      await db.insert(teacherAssignments).values({
        schoolId: school.id,
        teacherId: createdTeachers[0].id,
        subjectId: grade5aMath.id,
        sectionId: grade5a.id,
        academicYearId: academicYear.id,
      });
    }

    if (grade5aEng && grade5a && createdTeachers[1]) {
      await db.insert(teacherAssignments).values({
        schoolId: school.id,
        teacherId: createdTeachers[1].id,
        subjectId: grade5aEng.id,
        sectionId: grade5a.id,
        academicYearId: academicYear.id,
      });
    }

    console.log('✅ Teacher assignments created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Super Admin: basithunyawrr@gmail.com / Admin@123');
    console.log('School Admin: admin@demoacademy.com / password123');
    console.log('Teacher: teacher@demoacademy.com / password123');
    console.log('Parent: ali.khan@email.com / password123');
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
