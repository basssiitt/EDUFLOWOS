import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { validateCsvData, processCsvImport, parseCsvText } from '@/lib/services/csv-import';

// POST /api/csv-import - Import students from CSV
export const POST = withAuth(async (req, user) => {
  const schoolId = user.schoolId!;
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string; // 'validate' or 'import'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const csvText = await file.text();
    const rows = parseCsvText(csvText);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    if (rows.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 students per import' },
        { status: 400 }
      );
    }

    // Validate the data
    const validationResult = await validateCsvData(rows, schoolId);

    if (action === 'validate') {
      return NextResponse.json({
        valid: validationResult.valid,
        totalRows: rows.length,
        validRows: validationResult.data.length,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        preview: validationResult.data.slice(0, 5),
      });
    }

    // Process the import
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          errors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const result = await processCsvImport(
      validationResult.data,
      schoolId,
      user.id
    );

    return NextResponse.json({
      success: result.success,
      studentsCreated: result.studentsCreated,
      parentsCreated: result.parentsCreated,
      credentials: result.credentials,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}, { roles: ['school_admin'] });
