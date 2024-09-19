import { IProjectJob, IProjectStructure } from "@/interfaces/ProjectsInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";



export class ProjectsStore{
    private static structures: Array<IProjectStructure> | null = null;
    private static projectsJobs: Array<IProjectJob> | null = null;

    public static async getStructures() : Promise<Array<IProjectStructure>>{
        if (ProjectsStore.structures){
            return ProjectsStore.structures;
        }else{
            await ProjectsStore.getStructuresFromServer();
            return ProjectsStore.structures as unknown as Array<IProjectStructure>;
        }
    }
    public static async getProjectsJobs() : Promise<Array<IProjectJob>>{
        if (ProjectsStore.projectsJobs){
            return ProjectsStore.projectsJobs;
        }else{
            await ProjectsStore.getProjectsJobsFromServer();
            return ProjectsStore.projectsJobs as unknown as Array<IProjectJob>;
        }
    }



    private static async getStructuresFromServer(){
        const response = await RequestAPI.get('/projects/structures');
        ProjectsStore.structures = response;
    }
    private static async getProjectsJobsFromServer(){
        const response = await RequestAPI.get('/projects/jobs');
        ProjectsStore.projectsJobs = response;
    }
    public static async refreshStructures()
    {
        await ProjectsStore.getStructuresFromServer();
    }
    public static async refreshProjectsJobs()
    {
        await ProjectsStore.getProjectsJobsFromServer();
    }
}