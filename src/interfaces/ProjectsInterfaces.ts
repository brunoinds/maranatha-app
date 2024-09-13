export enum EProjectJobStatus {
    WaitingApproval = 'WaitingApproval',
    Ongoing = 'Ongoing',
    WaitingToStart = 'WaitingToStart',
    Finished = 'Finished',
}

export enum EProjectStructureBuildingType {
    Church = 'Church',
    School = 'School',
    Well = 'Well',
    Other = 'Other',
}

export enum EProjectEventTypeStatus {
    NewConstruction = 'NewConstruction',
    Renovation = 'Renovation',
    Repair = 'Repair',
    Painting = 'Painting',
    Addition = 'Addition',
    Fundraising = 'Fundraising',
    Medical = 'Medical',
    VBS = 'VBS',
    Evangelism = 'Evangelism',
    Landscaping = 'Landscaping',
    Other = 'Other',
    Meetings = 'Meetings',
    Maintenance = 'Maintenance',
}

export enum EProjectConstructionTaskStatus {
    Ongoing = 'Ongoing',
    WaitingToStart = 'WaitingToStart',
    Finished = 'Finished',
}

export enum EProjectConstructionPhaseStatus {
    Ongoing = 'Ongoing',
    WaitingToStart = 'WaitingToStart',
    Finished = 'Finished',
}

export class ProjectEnumsDescriptor {
    static jobStatus(status: EProjectJobStatus): string {
        const descriptions: { [key in EProjectJobStatus]: string } = {
            [EProjectJobStatus.WaitingApproval]: 'Esperando Aprobación',
            [EProjectJobStatus.Ongoing]: 'En Curso',
            [EProjectJobStatus.WaitingToStart]: 'Esperando Inicio',
            [EProjectJobStatus.Finished]: 'Concluído',
        };
        return descriptions[status] || 'Unknown';
    }

    static structureBuildingType(type: EProjectStructureBuildingType): string {
        const descriptions: { [key in EProjectStructureBuildingType]: string } = {
            [EProjectStructureBuildingType.Church]: 'Iglesia',
            [EProjectStructureBuildingType.School]: 'Escuela',
            [EProjectStructureBuildingType.Well]: 'Pozo',
            [EProjectStructureBuildingType.Other]: 'Otro',
        };
        return descriptions[type] || 'Unknown';
    }

    static eventTypeStatus(status: EProjectEventTypeStatus): string {
        const descriptions: { [key in EProjectEventTypeStatus]: string } = {
            [EProjectEventTypeStatus.NewConstruction]: 'Construcción Nueva',
            [EProjectEventTypeStatus.Renovation]: 'Renovación',
            [EProjectEventTypeStatus.Repair]: 'Reparación',
            [EProjectEventTypeStatus.Painting]: 'Pintura',
            [EProjectEventTypeStatus.Addition]: 'Adición',
            [EProjectEventTypeStatus.Fundraising]: 'Recaudación de Fondos',
            [EProjectEventTypeStatus.Medical]: 'Médico',
            [EProjectEventTypeStatus.VBS]: 'Escuela Bíblica de Vacaciones',
            [EProjectEventTypeStatus.Evangelism]: 'Evangelismo',
            [EProjectEventTypeStatus.Landscaping]: 'Paisajismo',
            [EProjectEventTypeStatus.Other]: 'Otro',
            [EProjectEventTypeStatus.Meetings]: 'Reuniones',
            [EProjectEventTypeStatus.Maintenance]: 'Mantenimiento',
        };
        return descriptions[status] || 'Unknown';
    }

    static constructionTaskStatus(status: EProjectConstructionTaskStatus): string {
        const descriptions: { [key in EProjectConstructionTaskStatus]: string } = {
            [EProjectConstructionTaskStatus.Ongoing]: 'En Curso',
            [EProjectConstructionTaskStatus.WaitingToStart]: 'Esperando Inicio',
            [EProjectConstructionTaskStatus.Finished]: 'Concluído',
        };
        return descriptions[status] || 'Unknown';
    }

    static constructionPhaseStatus(status: EProjectConstructionPhaseStatus): string {
        const descriptions: { [key in EProjectConstructionPhaseStatus]: string } = {
            [EProjectConstructionPhaseStatus.Ongoing]: 'En Curso',
            [EProjectConstructionPhaseStatus.WaitingToStart]: 'Esperando Inicio',
            [EProjectConstructionPhaseStatus.Finished]: 'Concluído',
        };
        return descriptions[status] || 'Unknown';
    }
}

export class ProjectColorsDescriptor {
    public static readonly colors: { [key: string]: string } = {
        green: '#4CAF50',
        red: '#F44336',
        blue: '#2196F3',
        orange: '#FF9800',
        purple: '#9C27B0',
        teal: '#009688',
        cyan: '#00BCD4',
        pink: '#E91E63',
        brown: '#795548',
    }
}


export interface IProjectJob {
    id: number;
    created_at: string;
    updated_at: string;
    job_code: string;
    project_structure_id: number;
    width: string | null;
    height: string | null;
    area: string | null;
    admins_ids: number[];
    supervisor_id: number;
    event_type: EProjectEventTypeStatus;
    scheduled_start_date: string;
    scheduled_end_date: string;
    started_at: string | null;
    ended_at: string | null;
    status: EProjectJobStatus;
    final_report: any | null;
    marketing_report: any | null;
    messages: any[];
}
export interface INewProjectJob extends Omit<IProjectJob, 'id' | 'created_at' | 'updated_at'> {}

export interface IProjectStructure {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    structure_type: string;
    building_type: EProjectStructureBuildingType;
    axes_count: number | null;
    beams_count: number | null;
    columns_count: number | null;
    stringers_count: number | null;
    facades_count: number | null;
    default_phases: {
        construction: IDefaultConstructionPhase[];
        studio: any[]; 
    };
}

export interface INewProjectStructure extends Omit<IProjectStructure, 'id' | 'created_at' | 'updated_at'> {

}

export interface IDefaultConstructionPhase {
    name: string;
    description: string;
    expense_code: string;
    color: string;
    average_days: number;
    tasks: IDefaultConstructionTask[];
}

interface IDefaultConstructionTask {
    name: string;
    description: string;
    average_days: number;
}

export interface IProjectConstructionPhase {
    id: number;
    created_at: string;
    updated_at: string;
    project_job_id: number;
    expense_code: string;
    name: string;
    description: string | null;
    color: string | null;
    status: EProjectConstructionPhaseStatus;
    scheduled_start_date: string;
    scheduled_end_date: string;
    started_at: string | null;
    ended_at: string | null;
    progress: number;
    final_report: {
        attachments_ids: string[];
        notes: string;
    } | null;
}
export interface INewProjectConstructionPhase extends Omit<IProjectConstructionPhase, 'id' | 'created_at' | 'updated_at'> {}

export interface IProjectConstructionTask {
    id: number;
    created_at: string;
    updated_at: string;
    project_job_id: number;
    project_construction_phase_id: number;
    name: string;
    description: string | null;
    status: EProjectConstructionTaskStatus;
    scheduled_start_date: string;
    scheduled_end_date: string;
    started_at: string | null;
    ended_at: string | null;
    count_workers: number;
    progress: number;
    daily_reports: IProjectConstructionTaskDailyReport[];
}
export interface INewProjectConstructionTask extends Omit<IProjectConstructionTask, 'id' | 'created_at' | 'updated_at'> {}

interface IProjectConstructionTaskDailyReport {
    date: string;
    progress: number;
    count_workers: number;
    notes: string;
    attachments_ids: string[];
}
export interface INewProjectConstructionTaskDailyReport extends Omit<IProjectConstructionTaskDailyReport, 'id' | 'created_at' | 'updated_at'> {}