import { IJob, IProject } from "@/interfaces/JobsAndProjectsInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { TStorage } from "@/utils/Toolbox/TStorage";

class JobersAndProjects{
    private static jobers: Array<IJob>|null = null;
    private static projects: Array<IProject>|null = null
    
    public static getJobers(): Promise<Array<IJob>>{
        return new Promise((resolve, reject) => {
            if (JobersAndProjects.jobers){
                resolve(JobersAndProjects.jobers);
            }else{
                JobersAndProjects.getContents().then(() => {
                    resolve(JobersAndProjects.jobers as Array<IJob>);
                }).catch(() => {
                    reject();
                })
            }
        })
    }
    public static getProjects(): Promise<Array<IProject>>{
        return new Promise((resolve, reject) => {
            if (JobersAndProjects.projects){
                resolve(JobersAndProjects.projects);
            }else{
                JobersAndProjects.getContents().then(() => {
                    resolve(JobersAndProjects.projects as Array<IProject>);
                }).catch(() => {
                    reject();
                })
            }
        })
    }

    private static getContents(): Promise<void>{
        return new Promise((resolve, reject) => {
            if (navigator.onLine){
                JobersAndProjects.getContentsFromServer().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            }else{
                JobersAndProjects.getContentsFromLocalStorage().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            }
        })
    }

    private static getContentsFromLocalStorage(): Promise<void>{
        return new Promise((resolve) => {
            TStorage.load('jobersAndProjects', {
                jobers: [],
                projects: []
            }).then((bucket) => {
                JobersAndProjects.jobers = bucket.data.jobers;
                JobersAndProjects.projects = bucket.data.projects;
                resolve();
            })
        })
    }

    private static getContentsFromServer(): Promise<void>{
        return new Promise(async (resolve, reject) => {
            const jobs = await RequestAPI.get("/jobers") as unknown as Array<IJob>;
            const projects = await RequestAPI.get("/projects") as unknown as Array<IProject>;

            TStorage.load('jobersAndProjects', {
                jobers: [],
                projects: []
            }).then((bucket) => {
                bucket.data.jobers = jobs;
                bucket.data.projects = projects;
                bucket.save().then(() => {
                    JobersAndProjects.getContentsFromLocalStorage().then(() => {
                        resolve();
                    })
                })
            })
        })
    }
}


export { JobersAndProjects }