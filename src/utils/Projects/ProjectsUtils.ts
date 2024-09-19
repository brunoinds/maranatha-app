import { IProjectConstructionPhase, IProjectConstructionTask, IProjectJob } from "@/interfaces/ProjectsInterfaces";
import { DateTime } from "luxon";



export class ProjectSchedule{
    public static schedule(projectJob: IProjectJob): {
        date: string,
        events: {}[]
    }[]{
        const scheduledDaysCount = Math.ceil(DateTime.fromISO(projectJob?.scheduled_end_date as string).diff(DateTime.fromISO(projectJob?.scheduled_start_date  as string), 'days').days);
        const daysMatrix = Array.from({ length: scheduledDaysCount }, (_, i) => {
            return {
                date: DateTime.fromISO(projectJob?.scheduled_start_date as string).plus({ days: i }).toISODate() as string,
            }
        })
        
        const constructionPhasesOrdered = projectJob?.construction_phases?.toSorted((a, b) => {
            //Sort order, always from the oldest to the newest scheduled_start_date, if same day, then sort by scheduled_end_date where the oldest is last:
            if (a.scheduled_start_date === b.scheduled_start_date) {
                return a.scheduled_end_date > b.scheduled_end_date ? 1 : -1;
            }
            return a.scheduled_start_date > b.scheduled_start_date ? 1 : -1;
        }).map((phase) => {
            return {
                ...phase,
                tasks: phase.tasks?.toSorted((a, b) => {
                    //Sort order, always from the oldest to the newest scheduled_start_date, if same day, then sort by scheduled_end_date where the oldest is last:
                    if (a.scheduled_start_date === b.scheduled_start_date) {
                        return a.scheduled_end_date > b.scheduled_end_date ? 1 : -1;
                    }
                    return a.scheduled_start_date > b.scheduled_start_date ? 1 : -1;
                })
            }
        })
        
            
            const rows:{
                task: IProjectConstructionTask, 
                phase: IProjectConstructionPhase, 
                isFirstTask: boolean, 
                slots: {
                    date: string, 
                    isParticipant: boolean,
                    backgroundColor: string,
                    wasForgottenToDailyReport: boolean,
                }[]
            }[] = [];
        
            constructionPhasesOrdered?.forEach((phase) => {
                phase.tasks?.forEach((task, index) => {
                    rows.push({
                        task,
                        phase: phase,
                        isFirstTask: index == 0,
                        slots: daysMatrix.map((day) => {
                            const dailyReport = task.daily_reports?.find((report) => DateTime.fromISO(report.date as string).toISODate() === DateTime.fromISO(day.date).toISODate());
                            const isParticipant = (DateTime.fromISO(day.date).toISODate() >= DateTime.fromISO(task.scheduled_start_date as string).toISODate()) && (DateTime.fromISO(day.date).toISODate() <= DateTime.fromISO(task.scheduled_end_date as string).toISODate());
                            const wasForgottenToDailyReport = (() => {
                                if (!isParticipant){
                                    return false;
                                }
                                if (dailyReport){
                                    return false;
                                } else {
                                    return DateTime.fromISO(day.date).toISODate() < DateTime.now().toISODate();
                                }
                            })();
                            const hasDailyReport = dailyReport ? true : false;
        
        
        
                            return {
                                date: day.date,
                                isParticipant,
                                wasForgottenToDailyReport,
                                hasDailyReport
                            }
                        })
                    })
                })
            })
        
            return {
                rows: rows
            }
    }
}