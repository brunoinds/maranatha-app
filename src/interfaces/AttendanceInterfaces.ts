interface IAttendance{
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    date: string;
    from_date: string;
    to_date: string;
    job_code: string;
    expense_code: string;
    description: string|null;
}

enum EAttendanceStatus{
    Present = "Present",
    Absent = "Absent",
    Justified = "Justified"
}

export type { IAttendance, EAttendanceStatus };